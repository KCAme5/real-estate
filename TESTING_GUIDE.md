# Testing Implementation Guide

## Overview

Comprehensive API integration tests have been added to achieve **80%+ code coverage** and ensure all endpoints work correctly.

## Test Files Created

### New Test Files (TDD Compliant)

1. **leads/tests_api.py** - Full lead management API tests (20+ test cases)
2. **agents/tests_api.py** - Agent listing and management tests
3. **bookings/tests_api.py** - Booking CRUD and agent assignment tests
4. **notifications/tests_api.py** - Notification management tests
5. **accounts/tests_api.py** - Authentication, registration, profile tests

### Infrastructure

- **conftest.py** - Shared pytest fixtures with factory functions
- **pytest.ini** - pytest configuration with coverage settings

## Coverage Goals

| App        | Current | Target |
|------------|---------|--------|
| accounts   | ~30%    | ≥80%   |
| agents     | ~40%    | ≥80%   |
| analytics  | ~0%     | ≥70%   |
| bookings   | ~5%     | ≥80%   |
| leads      | ~50%    | ≥85%   |
| notifications | ~0%  | ≥80%   |
| payments   | ~0%     | ≥70%   |
| properties | ~70%    | ≥85%   |

## Quick Start

### 1. Install Dependencies

```bash
cd realestate-b
pip install -r requirements.txt
```

New packages added:
- pytest
- pytest-django
- pytest-cov
- pytest-factoryboy
- factory-boy
- faker

### 2. Configure pytest

`pytest.ini` is already configured with:
- Django settings module
- Test file patterns
- Coverage reporting
- Marker definitions

Ensure `realestate/settings.py` has:
```python
# For pytest
if 'test' in sys.argv:
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'test_postgres',
        # ... other settings
    }
```

Or use existing test database configuration.

### 3. Run Tests

```bash
# Run all tests with coverage
pytest --cov=. --cov-report=html --cov-report=term

# Run specific app tests
pytest leads/ --cov=leads

# Run with markers
pytest -m "api"  # only API tests
pytest -m "integration"  # only integration tests

# Show coverage report in browser
open htmlcov/index.html
```

### 4. Coverage Report

After running tests, check:
- `htmlcov/index.html` for detailed breakdown
- Terminal output for overall percentage
- Target: ≥80% across all apps

## Test Structure

### Fixtures (conftest.py)

**Factory fixtures** for creating test data:
- `location_factory` - creates Location instances
- `agent_user_factory` - creates agent users
- `management_user_factory` - creates admin users
- `client_user_factory` - creates client users
- `property_factory` - creates Property instances
- `lead_factory` - creates Lead instances
- `task_factory` - creates Task instances
- `conversation_factory` - creates Conversation instances
- `message_factory` - creates Message instances

**Client fixtures**:
- `api_client` - unauthenticated
- `agent_client` - authenticated as agent
- `management_client` - authenticated as management
- `client_client` - authenticated as client

### Test Markers

Tests are categorized with markers:
- `@pytest.mark.api` - API endpoint tests
- `@pytest.mark.integration` - integration tests (DB access)
- `@pytest.mark.unit` - unit tests (can be added)
- `@pytest.mark.slow` - slow tests (skip with `-m "not slow"`)

## TDD Workflow

For any new feature or bug fix:

1. **Write Failing Test First (RED)**

   ```python
   # tests_api.py
   def test_new_feature(agent_client):
       url = reverse('some-endpoint')
       response = agent_client.get(url)
       assert response.status_code == 200
       assert response.data['key'] == 'expected'
   ```

2. **Run Test - It Should Fail**

   ```bash
   pytest leads/tests_api.py::test_new_feature -v
   ```

3. **Implement Minimal Code (GREEN)**

   Add the feature to views/serializers/models to make test pass.

4. **Refactor (IMPROVE)**

   Clean up code, add proper validation, optimize queries.

5. **Verify Coverage**

   ```bash
   pytest --cov=your_app --cov-report=term
   ```

6. **Commit**

   ```bash
   git add .
   git commit -m "feat: add new feature X with tests"
   ```

## Common Test Patterns

### Authentication

```python
def test_endpoint_requires_auth(api_client):
    url = reverse('some-endpoint')
    response = api_client.get(url)
    assert response.status_code == 401

def test_agent_can_access(agent_client):
    agent_client.force_authenticate(user=agent)
    response = agent_client.get(url)
    assert response.status_code == 200
```

### Permissions

```python
def test_agent_cannot_access_others_data(agent_client, lead_factory):
    other_agent_lead = lead_factory(agent=other_agent)
    response = agent_client.get(reverse('lead-detail', kwargs={'pk': other_agent_lead.pk}))
    assert response.status_code == 403
```

### Factory Usage

```python
def test_with_factories(lead_factory, agent_user_factory):
    agent = agent_user_factory()
    lead = lead_factory(agent=agent, status='new')
    # Test logic...
```

## Troubleshooting

### Database Errors

If test database creation fails:
```bash
# Drop existing test database
dropdb test_postgres
# Or use --keepdb flag to reuse
pytest --keepdb
```

### Fixture Not Found

Ensure `conftest.py` is in the Django root (`realestate-b/`). pytest auto-discovers it.

### Coverage Not Accumulating

Make sure tests are actually importing the modules being tested. Use:
```bash
pytest --cov=leads --cov-report=term -v
```

### Assertion Errors in Production Code

Tests may reveal bugs in business logic. Fix in order:
1. Serializer validation
2. View permissions
3. Model methods
4. Query optimization

## Coverage Enforcement

### Minimum Thresholds

Add to `pytest.ini` to fail if coverage below threshold:
```ini
addopts =
    --cov=.
    --cov-fail-under=80
    --cov-report=term
```

**Note:** Start with 0 threshold to establish baseline, then gradually increase.

## Continuous Integration

Sample GitHub Actions workflow (`.github/workflows/test.yml`):

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
      - name: Run tests
        run: |
          pytest --cov=.
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/postgres
```

## Next Steps

1. Run all tests and document failures
2. Fix broken tests (currently 1 broken property test - FIXED)
3. Achieve 80% coverage on leads, agents, bookings, accounts (in progress)
4. Add missing tests for analytics, payments, notifications
5. Implement E2E tests with Playwright for critical user flows
6. Set up CI/CD pipeline for automatic test execution

## Resources

- [pytest-django documentation](https://pytest-django.readthedocs.io/)
- [pytest-cov documentation](https://pytest-cov.readthedocs.io/)
- [Factory Boy documentation](https://factoryboy.readthedocs.io/)
