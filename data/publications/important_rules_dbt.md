# Things learned from the most revised DBT project

> Concrete rules about code and structure, each with clear steps on how to execute them.  

---

## 1. 🗂️ Model Layering & Folder Structure

### RULE: Don't create duplicate YAML files for an existing source or layer
Before creating a new `_models.yml` or `_sources.yml`, check whether one already exists for that source. If it does, add your entries to the existing file.

---

### RULE: Place models in the correct dbt layer
`staging/` must be thin wrappers over raw sources only. Any filtering, joining, or business logic belongs in `intermediate/`.

---

### RULE: Folder path and model name prefix must match
The subfolder a model lives in must be consistent with its name prefix.

---

### RULE: Every new model file must have an entry in the models YAML
Pre-commits enforce that every `.sql` model has a corresponding YAML entry. Missing entries will cause pre-commit failures.

---

## 2. 🧱 SQL Code

### RULE: Every column defined in a CTE must appear in the final SELECT
When adding new columns to a CTE, always verify they are included in the model's final `SELECT`. It is a common mistake to enrich a CTE but never expose the columns.

---

### RULE: Use `systemmodstamp` for Salesforce deduplication, partition by `id`
Singer uses `systemmodstamp` as the ingestion watermark to determine when to pull new rows from the Salesforce API. Deduplication must order by this column and partition by the entity's own primary key.

---

### RULE: Always comment filter and exclusion logic in SQL
Any `WHERE` clause that excludes records must have an inline comment explaining why. Undocumented filters become a maintenance hazard.

---

## 3. ⚙️ Materialization

### RULE: Don't explicitly declare `materialized='view'` in staging models
`models/staging/` is already configured as `view` by default in `dbt_project.yml`. Declaring it in individual model configs is redundant.

---

### RULE: Non-default materializations must be justified with a comment
When a model uses a materialization different from its layer default, document the reason in a comment next to the config.

---

### RULE: Incremental filter logic must be placed correctly, and incremental models require tests
Placing incremental filtering at the wrong point in the model won't improve build time. Incremental models also need tests that validate correctness over time.

---

## 4. ✅ Testing

### RULE: Every model must have at minimum `unique` and `not_null` tests on its key column
No model should be merged without basic data tests on the primary key.

**How to execute:**
```yaml
models:
  - name: name_of_model
    columns:
      - name: contact_id
        tests:
          - unique
          - not_null
```
> *"Should we have some tests for this column?"*  
> *"Need to add data tests."*

---

### RULE: CASE WHEN derived columns must have a test validating their output
When a column is built with `CASE WHEN`, add a test to assert its expected values.

**How to execute:**
```yaml
- name: name_of_column
  tests:
    - accepted_values:
        values: ['subscribed', 'unsubscribed', 'pending']
```
Or for numeric ranges using `utilities`:
```yaml
- name: name_of_column
  tests:
    - dbt_utils.expression_is_true:
        expression: ">= 0"
```
> *"Write a test for this column since you are doing this case when. Something like expected values between or do not expect certain values."*

---

### RULE: Don't use `severity: warn` without a documented reason
Test severity defaults to `error`. Using `severity: warn` silently lets failures pass — only use it intentionally and explain why.

**How to execute:**
```yaml
# ❌ Avoid unless you have a specific reason
- unique:
    severity: warn

# ✅ Default — just list the test name
- unique
```
> *"Why is this `severity=\"warn\"` for?"*

---

### RULE: Don't use `store_failures_as` without a reason
`store_failures_as: view` creates a queryable view of test failures. Only add it when you actively need to inspect failures.

**How to execute:**
```yaml
# ❌ Remove if not needed
- not_null:
    store_failures_as: view

# ✅ Clean default
- not_null
```
> *"How come you added `store_failures_as=\"view\"` to this test?"*

---

### RULE: CI tests must pass before requesting review or merging
A PR with failing tests must not be submitted for review.

**How to execute:**
```bash
# Run tests locally before pushing
dbt test --select path:models/your/model

# Or verify the CI run in the PR Actions tab — all jobs must be green
```
> *"There's still some comments that haven't been addressed. Also you need to address this failing test: `unique_dm_marketing_lcm__b2b_braze_seedlist_email`."*

---

## 5. 📝 YAML & Documentation

### RULE: Model descriptions belong in the YAML, not inline in SQL
Use the `description:` field in `_models.yml`. Match the description to the actual layer the model lives in.

**How to execute:**
```yaml
# ✅ In _location__models.yml
models:
  - name: name_of_the_model
    description: >
      Explain what it does and document properly to later understanding.
      Intermediate model — marketing LCM layer.
```
```sql
-- ❌ Not here — don't use inline SQL comments as model documentation
-- Model: identifies new users for the B2B seedlist
```
> *"Please put model descriptions in the models yaml."*  
> *"This description says this is a 'staging model' but it's in the intermediate layer. Please fix."*

---

### RULE: Don't add manual source/model links in YAML descriptions
dbt auto-generates lineage from `source()` and `ref()`. Manual URL links in descriptions go stale.

**How to execute:**
```yaml
# ❌ Remove manual links
description: "See source at https://github.com/..."

# ✅ Just describe the model — dbt handles the lineage graph
description: "Just use a brief description of the model."
```
> *"You don't really need to add links to the source since dbt self documents these things via the `source` and `ref` macros."*

---

### RULE: Keep YAML formatting clean — no empty descriptions, no extra blank lines between columns

**How to execute:**
```yaml
# ❌ Messy
models:
  - name: name_of_model
    description: ""
    columns:

      - name: id

      - name: email

# ✅ Clean
models:
  - name: name_of_model
    columns:
      - name: id
      - name: email

  - name: name_of_model
    columns:
      - name: id
```
Rules:
1. Delete any `description: ""` lines
2. No blank lines between columns within a model entry
3. One blank line between model entries

> *"Please remove the empty descriptions (i.e. `description: \"\"`) and spaces between columns. Let's just have a single empty space between tables."*

---

## 6. 🏷️ Naming Conventions

### RULE: Column names must follow the project naming contract (enforced by pre-commits)
The project has a pre-commit hook that validates column naming format. The convention is `<noun>_<qualifier>` — patterns like `date_submit` are rejected.

**How to execute:**
```sql
-- ❌ Violates naming contract
date_submit

-- ✅ Correct
submit_date
```
```bash
# Run pre-commits locally before pushing to catch violations
pre-commit run --all-files
```
> *"Perhaps `submit_date` is a better name? Not sure how `date_submit` passes our name contract in the pre-commits."*

---

### RULE: Exposure names must be distinct from and more descriptive than the model they expose
An exposure represents a downstream consumer or system — name it after the business concept, not the dbt model.

**How to execute:**
```yaml
# ❌ Mirrors the model name — not useful
exposures:
  - name: name_of_the_model

# ✅ Describes the downstream use case
exposures:
  - name: name_of_model_in_exposure
    type: application
    maturity: high
    depends_on:
      - ref('name_of_the_model')
```
> *"Please make the exposure name different than the DM model name. Perhaps something like `braze_b2b_email_subscriptions`?"*

---

## 8. 🔗 Migration PRs

### RULE: Migration PRs must link the source code being deprecated
When a PR migrates or replaces logic from another repo or script, the PR description must include a direct link to the original source so reviewers can verify parity.

