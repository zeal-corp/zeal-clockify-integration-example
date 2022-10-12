# Zeal + Clockify Integration

## Description
This app serves as an example of how one might integrate a time and attendance system, such as Clockify, with Zeal's payroll API.

### Tech Used
- Node
- Express
- TypeScript
- Jest

* * * 

## Getting Started

### Installation

1. Clone the repository.
```
git clone git@github.com:zeal-corp/zeal-clockify-integration-example.git
```
2. `cd` to the new directory.
3. Run `npm install`.
4. Add a `.env` file with you `ZEAL_TEST_KEY` and `ZEAL_COMPANY_ID`.

```
echo "ZEAL_TEST_KEY={{YOUR TEST KEY}}\nZEAL_COMPANY_ID={{YOUR COMPANY ID}}" >> .env
```
5. Run `npm test` to ensure everything is working as expected.
6. Run `npm run dev` to start the server in development mode.

In the terminal you should see:

> $ 🦓🦓🦓 [SERVER_START]: Server is running at http://localhost:3000

