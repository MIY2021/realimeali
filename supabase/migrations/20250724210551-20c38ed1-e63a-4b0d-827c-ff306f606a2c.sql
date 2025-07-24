-- Security Fix 1: Add search_path protection to all database functions
-- This prevents search path manipulation attacks

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_meal_plan_data()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  -- If it's a freetyped meal, meal_name must be provided and recipe_id should be null
  IF NEW.is_freetyped = true THEN
    IF NEW.meal_name IS NULL OR NEW.meal_name = '' THEN
      RAISE EXCEPTION 'meal_name is required for freetyped meals';
    END IF;
    -- Allow recipe_id to be null for freetyped meals
    NEW.recipe_id := NULL;
  ELSE
    -- If it's not a freetyped meal, recipe_id must be provided
    IF NEW.recipe_id IS NULL THEN
      RAISE EXCEPTION 'recipe_id is required for non-freetyped meals';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.toggle_community_recipe_favorite(recipe_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  is_favorited boolean;
BEGIN
  -- Check if already favorited
  SELECT EXISTS (
    SELECT 1 FROM public.community_recipe_favorites 
    WHERE user_id = auth.uid() AND community_recipe_id = recipe_id
  ) INTO is_favorited;
  
  IF is_favorited THEN
    -- Remove from favorites
    DELETE FROM public.community_recipe_favorites 
    WHERE user_id = auth.uid() AND community_recipe_id = recipe_id;
    RETURN false;
  ELSE
    -- Add to favorites
    INSERT INTO public.community_recipe_favorites (user_id, community_recipe_id)
    VALUES (auth.uid(), recipe_id);
    RETURN true;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.add_default_recipe_to_household()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Add the default Pasta Arrabbiata recipe to the new household
  INSERT INTO public.recipes (
    title,
    description,
    ingredients,
    instructions,
    prep_time,
    cook_time,
    servings,
    user_id,
    household_id,
    is_favorite
  ) VALUES (
    'Pasta Arrabbiata',
    'A classic Italian pasta dish with a spicy tomato sauce. Simple, quick, and delicious!',
    ARRAY[
      '400g spaghetti or penne pasta',
      '400g canned crushed tomatoes',
      '4 cloves garlic, minced',
      '2-3 dried red chilies (or 1 tsp chili flakes)',
      '1/4 cup olive oil',
      '1/4 cup fresh parsley, chopped',
      '1/2 cup Parmesan cheese, grated',
      'Salt and black pepper to taste'
    ],
    ARRAY[
      'Bring a large pot of salted water to boil and cook pasta according to package directions until al dente.',
      'While pasta cooks, heat olive oil in a large pan over medium heat.',
      'Add minced garlic and dried chilies, cook for 1-2 minutes until fragrant.',
      'Add crushed tomatoes, season with salt and pepper. Simmer for 8-10 minutes.',
      'Drain pasta, reserving 1/2 cup pasta water.',
      'Add pasta to the sauce, toss well. Add pasta water if needed to loosen.',
      'Remove from heat, stir in fresh parsley.',
      'Serve immediately with grated Parmesan cheese.'
    ],
    15,
    20,
    4,
    NEW.created_by,  -- Use the actual user ID from the household
    NEW.id,
    false
  );
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_approval_completion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  total_members INTEGER;
  total_responses INTEGER;
  approved_responses INTEGER;
  request_household_id UUID;
BEGIN
  -- Get the household_id for this approval request
  SELECT household_id INTO request_household_id
  FROM public.meal_plan_approval_requests
  WHERE id = NEW.approval_request_id;

  -- Count total household members
  SELECT COUNT(*) INTO total_members
  FROM public.household_members
  WHERE household_id = request_household_id;

  -- Count total responses for this request
  SELECT COUNT(*) INTO total_responses
  FROM public.meal_plan_approvals
  WHERE approval_request_id = NEW.approval_request_id;

  -- Count approved responses
  SELECT COUNT(*) INTO approved_responses
  FROM public.meal_plan_approvals
  WHERE approval_request_id = NEW.approval_request_id AND approved = true;

  -- If all members have responded, update the request status
  IF total_responses = total_members THEN
    IF approved_responses = total_members THEN
      -- All members approved
      UPDATE public.meal_plan_approval_requests
      SET status = 'approved', updated_at = now()
      WHERE id = NEW.approval_request_id;
    ELSE
      -- At least one member rejected
      UPDATE public.meal_plan_approval_requests
      SET status = 'rejected', updated_at = now()
      WHERE id = NEW.approval_request_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.toggle_recipe_cooking_status(recipe_id_param uuid, household_id_param uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  current_status BOOLEAN;
  new_status BOOLEAN;
BEGIN
  -- Check if user is member of the household
  IF NOT EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_id = household_id_param 
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'User is not a member of this household';
  END IF;

  -- Get current cooking status
  SELECT has_cooked INTO current_status 
  FROM public.household_recipe_cooking_status 
  WHERE recipe_id = recipe_id_param 
  AND household_id = household_id_param;

  -- If no record exists, create one with cooked = true
  IF current_status IS NULL THEN
    INSERT INTO public.household_recipe_cooking_status (household_id, recipe_id, has_cooked, cooked_at)
    VALUES (household_id_param, recipe_id_param, true, now());
    RETURN true;
  END IF;

  -- Toggle the status
  new_status := NOT current_status;
  
  UPDATE public.household_recipe_cooking_status 
  SET 
    has_cooked = new_status,
    cooked_at = CASE WHEN new_status THEN now() ELSE NULL END,
    updated_at = now()
  WHERE recipe_id = recipe_id_param 
  AND household_id = household_id_param;

  RETURN new_status;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_public_share_id()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  -- Generate 12 character random string
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.public_recipe_shares WHERE public_share_id = result) LOOP
    result := '';
    FOR i IN 1..12 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
  END LOOP;
  
  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_share_view_count(share_id text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  UPDATE public.public_recipe_shares 
  SET view_count = view_count + 1 
  WHERE public_share_id = share_id AND is_active = true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.toggle_recipe_cooking_status_simple(recipe_id_param uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  current_status BOOLEAN;
  new_status BOOLEAN;
  recipe_household_id UUID;
BEGIN
  -- Get current cooking status and household_id
  SELECT has_cooked, household_id INTO current_status, recipe_household_id
  FROM public.recipes 
  WHERE id = recipe_id_param;

  -- Check if user is member of the household
  IF NOT EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_id = recipe_household_id 
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'User is not a member of this household';
  END IF;

  -- Toggle the status
  new_status := NOT current_status;
  
  UPDATE public.recipes 
  SET 
    has_cooked = new_status,
    updated_at = now()
  WHERE id = recipe_id_param;

  RETURN new_status;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_fruit_avatar(user_id_param uuid)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
  fruits TEXT[] := ARRAY['🍎', '🍊', '🍌', '🍇', '🍓', '🥝', '🍑', '🥭', '🍍', '🥥', '🍒', '🍈', '🥑', '🍐', '🥔'];
  fruit_index INTEGER;
BEGIN
  -- Use user ID to generate consistent random index
  fruit_index := (abs(hashtext(user_id_param::text)) % array_length(fruits, 1)) + 1;
  RETURN fruits[fruit_index];
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_household_member_simple(household_id uuid, user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_members.household_id = is_household_member_simple.household_id 
    AND household_members.user_id = is_household_member_simple.user_id
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_household_owner(household_id uuid, user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_members.household_id = is_household_owner.household_id 
    AND household_members.user_id = is_household_owner.user_id 
    AND household_members.role = 'owner'
  );
$function$;

CREATE OR REPLACE FUNCTION public.increment_recipe_meal_plan_count(recipe_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  UPDATE public.recipes 
  SET meal_plan_count = meal_plan_count + 1,
      updated_at = now()
  WHERE id = recipe_id_param;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_households(user_id uuid)
 RETURNS SETOF uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT household_id 
  FROM public.household_members 
  WHERE household_members.user_id = get_user_households.user_id;
$function$;

CREATE OR REPLACE FUNCTION public.is_household_member(household_id uuid, user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.household_members 
    WHERE household_members.household_id = is_household_member.household_id 
    AND household_members.user_id = is_household_member.user_id
  );
$function$;

CREATE OR REPLACE FUNCTION public.create_household_with_owner(household_name text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  new_household_id UUID;
BEGIN
  -- Create the household
  INSERT INTO public.households (name, created_by)
  VALUES (household_name, auth.uid())
  RETURNING id INTO new_household_id;
  
  -- Add creator as owner
  INSERT INTO public.household_members (household_id, user_id, role)
  VALUES (new_household_id, auth.uid(), 'owner');
  
  RETURN new_household_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_invitation_code()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  RETURN encode(gen_random_bytes(6), 'base64');
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_user_household_member(check_household_id uuid, check_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_id = check_household_id 
    AND user_id = check_user_id
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_user_household_owner(check_household_id uuid, check_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_id = check_household_id 
    AND user_id = check_user_id 
    AND role = 'owner'
  );
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  is_google_user BOOLEAN := false;
BEGIN
  -- Check if user signed up with Google
  is_google_user := (new.raw_user_meta_data ->> 'avatar_url') IS NOT NULL;
  
  INSERT INTO public.profiles (
    id, 
    full_name, 
    email, 
    avatar_url,
    auth_provider,
    avatar_type,
    avatar_data,
    profile_completed
  )
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    new.raw_user_meta_data ->> 'avatar_url',
    CASE WHEN is_google_user THEN 'google' ELSE 'email' END,
    CASE WHEN is_google_user THEN 'google' ELSE 'fruit' END,
    CASE WHEN is_google_user THEN NULL ELSE public.generate_fruit_avatar(new.id) END,
    is_google_user -- Google users have complete profiles, email users need to complete
  );
  RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_profiles()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT public.has_role(auth.uid(), 'admin');
$function$;

CREATE OR REPLACE FUNCTION public.approve_community_recipe(recipe_id uuid)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  UPDATE public.community_recipes 
  SET 
    is_approved = true,
    approved_by = auth.uid(),
    approved_at = now(),
    updated_at = now()
  WHERE id = recipe_id AND public.has_role(auth.uid(), 'admin');
$function$;

CREATE OR REPLACE FUNCTION public.reject_community_recipe(recipe_id uuid)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  UPDATE public.community_recipes 
  SET 
    is_active = false,
    updated_at = now()
  WHERE id = recipe_id AND public.has_role(auth.uid(), 'admin');
$function$;

CREATE OR REPLACE FUNCTION public.increment_community_recipe_view_count(recipe_id uuid)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  UPDATE community_recipes 
  SET view_count = view_count + 1 
  WHERE id = recipe_id;
$function$;

CREATE OR REPLACE FUNCTION public.increment_community_recipe_save_count(recipe_id uuid)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  UPDATE community_recipes 
  SET save_count = save_count + 1 
  WHERE id = recipe_id;
$function$;

-- Security Fix 2: Add trigger to prevent users from self-assigning admin roles
CREATE OR REPLACE FUNCTION public.prevent_admin_self_assignment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Only allow admin role assignment if the user is already an admin
  IF NEW.role = 'admin' AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only existing admins can assign admin roles';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the trigger
DROP TRIGGER IF EXISTS prevent_admin_self_assignment_trigger ON public.user_roles;
CREATE TRIGGER prevent_admin_self_assignment_trigger
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_admin_self_assignment();