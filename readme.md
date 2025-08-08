# Weather API

## Overview

This is an express API that wraps National Weather Service API and provides current weather forecast based on geolocation.

The API exposes four endpoints:

- `/health/live` - Checks status of the API
- `/health/ready` - Checks status of the API and the underlying service
- `/weather/forecast?lat=number&lng=number` - Gets forecast based on geolocation
- `/api/docs` - Self hosts API docs

## Getting Started

To run the API and view endpoints, do the following:

- Pull API from the github repository
- Run `npm install`
- Rename `.env.example` to `.env`. This file contains environment variables that the application requires at startup.
- Run `npm run local`
- API will start on default port 3000 if its left unchanged in the `.env` file
- To view api docs, go to `localhost:3000/api/docs`

In case of any incompatibility issues, please not that development is done on following versions:

- Node.js: v20.17.0
- tsc:  v5.9.2

## Architecture & Design

### Ensuring Type Safety with Zod

Typescript is best used when inputs of the system are throughly checked and therefore I have placed strict checks on every input, internal and external, that is coming the API. I have used zod for input validation mainly because zod provides elegant ways to define schemas, validate JSON against those schemas, and inferring types to use in the application. All this can be done without zod but since zod is widely used in the industry and is a well-known library, I did not hesitate to rely on it.

This essentially means that all the inputs and external services in the API are strictly type checked and failing to meet the type is often a critical error.


### Functional Design Approach

Since express expresses itself functionally, I found it best that the rest of the system follows convention and stick to the style of express to integrate with it better. Functional vs object oriented is a major design decision for any project, more so in nodejs where both paradigms are equally as popular with NestJS showcasing a powerful functional paradigm. So, with express, choosing functional paradigm was a natural choice.


### Decoupled and Layered Design

The intention with the project structure is to separate concerns and keep different components in separate boundaries i.e. folders. Having separation of concerns does two things:
- Makes it easier to organize the code and make mental models of the flow while working
- Makes it possible to test individual components

Keeping above in view, the project tries to separate out concerns as much as possible and it might seem excessive at a glance because the API's functionality is rather limited at this point but it is designed while keeping extensibility and testing in mind.

## API Features

### CORs Settings

Since this API is a demo, I have enabled CORs to allow all the headers. Enabling CORs lets users use the API via javascript in the browser.

### Rate Limits

Default rate limits are set to 20 requests in a minute. The implemented rate limiter is a weak implementation that is not production ready because in a production environment, we need more than an in-memory rate limiter. In a production scenario, the least we will do is change the rate limiter's memory store from in-memory to a cache like Redis or we will just offload rate limiting to an API gateway or any other edge services.

But still, in order to demonstrate my thought and understanding on rate limiters, I proceeded to add a basic one.

### Error Handling and Logging

Error handling is done globally via express middleware; which is where express shines. Every error is bubbled up and is handled and logged in a global exception handling layer. 

For logging, JSON format is chosen because every major logging and observability service provides querying on JSON logs plus its a good fit for most document based databases (like OpenSearch) if there ever is a need to move logs there.

## Development

### Testing

For writing and executing test cases, I used vitest. I picked it because it is quite fast, runs tests in parallel, is light weight, and is typescript compatible out-of-the-box and given that this is a small project with no strict requirements, picking vitest was a no brainer for me.

### AI Usage

I have the following to say about usage of AI in this project:

- Every design and implementation decision in the project is intentional and deliberate; which means that at no point during the development decisions were being drived by an LLM, when I say decisions, I mean:
  - Deciding how many layers the project will have
  - Deciding what piece of code lives in which file
  - Deciding how strict/lose should the type system be in the project
  - Etc.
- I have used AI on a micro level that is: 
  - Getting help with a pesky type error
  - Getting help while design a utility for logs
  - Using it as a sounding board (even though it loves to tell us that we are so right and so smart all the time!)
- One area where AI has been used the most is test case generation. I went over the code multiple times and made sure via prompts and via inspecting git changes that AI has not tried to overfit any test case by modifying the original methods