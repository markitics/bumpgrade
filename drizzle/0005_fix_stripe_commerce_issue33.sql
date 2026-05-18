UPDATE admin_roadmap_items
SET
  public_evidence_json = replace(public_evidence_json, '#34', '#33'),
  next_milestone = replace(next_milestone, '#34', '#33'),
  updated_at = unixepoch()
WHERE id IN ('roadmap-stripe-commerce', 'roadmap-checkout-offers');

UPDATE admin_user_journeys
SET
  issue_numbers_json = replace(issue_numbers_json, '34', '33'),
  source_evidence_json = replace(source_evidence_json, '/issues/34', '/issues/33'),
  happy_path_json = replace(happy_path_json, '#34', '#33'),
  validation_json = replace(validation_json, '#34', '#33'),
  updated_at = unixepoch()
WHERE id = 'journey-publisher-plans-first-checkout';
