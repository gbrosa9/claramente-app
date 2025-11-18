# ClaraMENTE Backend Testing Guide

## Running Tests

### Prerequisites
- Database setup (see main README)
- Test environment variables configured
- Dependencies installed

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test auth.test.ts

# Run tests in a specific directory
npm test tests/api/
```

### Test Structure

```
tests/
├── setup.ts              # Test configuration and database setup
├── api/                   # API endpoint tests
│   ├── auth.test.ts       # Authentication endpoints
│   ├── conversations.test.ts # Chat functionality
│   └── assessments.test.ts    # Assessment system
├── services/              # Service layer tests
│   ├── llm.test.ts        # LLM service functionality
│   └── voice.test.ts      # Voice/WebSocket functionality
└── utils/                 # Utility and helper tests
```

### Test Categories

#### Unit Tests
- Individual service functions
- Utility functions
- Data validation
- Error handling

#### Integration Tests
- API endpoints with database
- Service layer interactions
- Authentication flows
- Job queue processing

#### E2E Tests (Future)
- Complete user flows
- WebSocket connections
- File upload/download
- Multi-user scenarios

### Test Database

Tests use a separate SQLite database (`test.db`) that is:
- Created fresh for each test run
- Isolated from development data
- Automatically cleaned between tests
- Faster than PostgreSQL for testing

### Mocking Strategy

- **External APIs**: OpenAI, ElevenLabs, etc. are mocked
- **Authentication**: NextAuth sessions are mocked
- **WebSockets**: Socket connections are mocked
- **File System**: File operations use temporary directories

### Coverage Goals

- **API Routes**: 90%+ coverage
- **Service Layer**: 85%+ coverage  
- **Utilities**: 95%+ coverage
- **Database Models**: 80%+ coverage

### Common Test Patterns

#### API Testing
```typescript
import { GET, POST } from '@/app/api/example/route'
import { NextRequest } from 'next/server'

it('should handle valid request', async () => {
  const request = new NextRequest('http://localhost:3001/api/example', {
    method: 'POST',
    body: JSON.stringify({ data: 'test' }),
    headers: { 'Content-Type': 'application/json' }
  })

  const response = await POST(request)
  const data = await response.json()

  expect(response.status).toBe(200)
  expect(data.ok).toBe(true)
})
```

#### Service Testing
```typescript
import { ServiceClass } from '@/src/server/services/example'

it('should process data correctly', async () => {
  const service = new ServiceClass(config)
  const result = await service.processData(input)
  
  expect(result).toBeDefined()
  expect(result.status).toBe('success')
})
```

#### Database Testing
```typescript
import { prisma } from '../setup'

beforeEach(async () => {
  await prisma.model.deleteMany()
})

it('should create record', async () => {
  const record = await prisma.model.create({
    data: { field: 'value' }
  })
  
  expect(record.id).toBeDefined()
})
```

### Test Data Management

- Use factory functions for test data creation
- Clean up database state between tests
- Use realistic but anonymized test data
- Avoid hardcoded IDs when possible

### Performance Testing

- Monitor test execution time
- Parallel test execution where safe
- Database query optimization
- Memory usage monitoring

### Continuous Integration

Tests are automatically run on:
- Pull requests
- Main branch commits
- Scheduled daily runs
- Release candidate builds

### Debugging Tests

```bash
# Run single test with debug output
npm test -- --reporter=verbose auth.test.ts

# Run tests with Node.js inspector
node --inspect-brk node_modules/.bin/vitest run

# Use VS Code debugging
# Set breakpoints and use "Run and Debug" panel
```

### Known Limitations

- External API tests require environment configuration
- WebSocket tests are partially mocked
- File upload tests use temporary storage
- Some timing-dependent tests may be flaky

### Contributing Test Code

1. Write tests for new features
2. Maintain existing test coverage
3. Follow naming conventions
4. Include both positive and negative test cases
5. Document complex test scenarios
6. Use appropriate assertions and matchers