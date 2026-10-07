create or replace function public.replace_household_shopping_list(
  p_household_id uuid,
  p_created_by uuid,
  p_week_key text,
  p_items jsonb
)
returns setof public.household_shopping_lists
language plpgsql
security invoker
set search_path = public
as $$
begin
  delete from public.household_shopping_lists
  where household_id = p_household_id
    and week_key = p_week_key;

  return query
  insert into public.household_shopping_lists (
    household_id,
    created_by,
    name,
    week_key,
    is_custom,
    is_checked,
    recipe_ids,
    quantity,
    quantity_display,
    unit,
    consolidated_quantity,
    consolidated_unit,
    source_ingredients,
    category
  )
  select
    p_household_id,
    p_created_by,
    x.name,
    p_week_key,
    coalesce(x.is_custom, false),
    coalesce(x.is_checked, false),
    coalesce(x.recipe_ids, '{}'::uuid[]),
    x.quantity,
    x.quantity_display,
    coalesce(x.unit, ''),
    x.consolidated_quantity,
    coalesce(x.consolidated_unit, ''),
    coalesce(x.source_ingredients, '{}'::text[]),
    x.category
  from jsonb_to_recordset(p_items) as x(
    name text,
    is_custom boolean,
    is_checked boolean,
    recipe_ids uuid[],
    quantity numeric,
    quantity_display text,
    unit text,
    consolidated_quantity numeric,
    consolidated_unit text,
    source_ingredients text[],
    category text
  )
  returning *;
end;
$$;
