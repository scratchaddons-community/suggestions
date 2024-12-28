# Scratch Addons Suggestions

Hello, and welcome to my horrible code. It is I, Jazza, featuring Paul.

Let's go over some of the basics.

- This is written using SvelteKit.
- It is using Postgres as a database, with neon-db.
- It uses drizzle-orm for the ORM.
- We (well, I) use [Scratch Auth](https://auth.itinerary.eu.org/) for community members' authentication, and [GitHub OAuth](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps) for developers' authentication.

If you would like to contribute, follow the steps below:

## Contributing

- Make sure you have a suitable development environment, this includes the following:
  - [Node.js](https://nodejs.org/en)
  - [Docker](https://www.docker.com/)
  - [PNPM](https://pnpm.io/)
  - [A code editor](https://code.visualstudio.com/)
  - [A GitHub OAUTH application](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)
  - [A will to live](https://ljla.org.au/product/a-will-to-live-george-ginzburg/)
- Fork and clone the repository
- Run `pnpm i` to install the dependencies
- Populate the `.env` file with the appropriate values, see the [.env.example](./.env.example) file for details, and [#services](#services) for the services you will need to use
- Run `pnpm start` to start the local database, drizzle studio, and the dev server
- If this is your first time running the project, you will need to run `pnpm db:push` to create the database tables, and do this again whenever you make changes to the schema. I am lazy and usually drop the entire public schema and recreate it to avoid any conflicts.
  - Note: `db:push` needs to be run WHILE the database is running, so you will need to run it in a separate terminal.
- Profit! Unless your database is haunted, you should not see any suggestions yet. As of now, once you log in there will be a "Add mock suggestion" button, which will add a randomly generated suggestion to the database. You can also add suggestions manually through drizzle studio.
- Make your changes, and then make a pull request!!

## Important other notes

- This is a horrible codebase, and I am not a professional developer. I am a student, and this is my first time using a database properly.
- I am quite literally an idiot.
- If you are an experienced developer, I will most likely take your word for changes you want to make.
- That being said, unless it's necessary, lets not change the database schema lol.
- As of 15/12/24, this project is not finished, endorsed, or even in a functional state. It is a work in progress, and no Scratch Addons org members are involved in this project (yet)
- Icons from [https://icones.js.org/collection/material-symbols](https://icones.js.org/collection/material-symbols), standardized to a width and height of 1em, and rounded

## License

This project is licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.html).  
You are free to use, modify, and distribute this software under the terms of the license.  
See the [LICENSE](./LICENSE) file for details.

Why you would want to use this code is beyond me.

## Disclaimer

This project is not affiliated with, endorsed by, or approved by Scratch Addons. Yet.
It's position in the `scratchaddons-community` organization means nothing beyond "I know people".

Now, the reason I am writing this readme...

## TODO

- [ ] Add a new display mode to show more suggestions compactly
- [ ] Find a way to improve performance? I'm sure my database queries suck
- [x] This includes streaming of data on main page, and not invalidating data on nav to account or add suggestion, i think cuz in the page load it checks for the user from locals
- [x] ...actually allow users to add suggestions
- [ ] That includes images Jazza!! - Probably cloudinary or imagekit
- [ ] Add tips on making a good suggestion
- [x] Turn a few of my discord friends trans
- [ ] Make suggestions be openable?
- [ ] Add manual verification for github accounts - these are for devs only
- [ ] Permissions such as admin roles
- [x] Regret my life decisions
- [ ] Infinite scrolling?
- [ ] Add linking to other suggestions when marking as a dupe
- [ ] Add page numbers
- [ ] Add search params for things like pages, sorting, etc
- [ ] Basic image editing such as cropping or adding arrows and circles
- [ ] Add a status for what version something is being added in.
- [ ] Compact mode, remove images and less useful info

## Services

To run this project, you will need the following additional services:

- [Neon](https://neon.tech/)
- [A GitHub OAUTH application](https://github.com/settings/applications/new)
- [Cloudinary](https://cloudinary.com/)

Create a **Neon** account, and then create a new project. Choose a name and postgres version 17. You will be redirected to `https://console.neon.tech/app/projects/<project-name>/quickstart`, where you can easily copy the postgres snippet, and paste this into the .env file.

For the **GitHub OAUTH application**, follow the above link and create a new application. Choose a name, set the homepage URL to `http://localhost:5173`, and the callback URL to `http://localhost:5173/auth/callback/`. Make sure the value in the .env file is set to this callback URL.

Note: This is for development. Replace with whatever your domain is in production.

Create a **Cloudinary** account. Choose "Coding with APIs and SDKs". Navigate to settings, and then to "Product Environments" under "Account settings". Choose the three dots next to "Active" and select "Edit". Set your cloud name to whatever you would like, and save changes.

Then, go to the "API Keys" tab under "Product environment settings", and copy the following to your .env file:

- Cloud name: at the top of the page next to the heading "API Keys" in blue
- API key: In the middle of the page, you can't miss it.
- API secret: Hover over the redacted secret and click the eye icon to the right of it. Confirm your password, and then press the copy button that appears next to the eye icon.

I recommend deploying this project to [Vercel](https://vercel.com/) for production, as I have had issues with Cloudflare Pages. This may have been fixed by now, as I recently removed the Cloudinary package from the images test, which was not runtime agnostic. I'll try it now and report back lol. It totally works, I am a genius.

With the expected usage of this project, this should be able to run on free tiers of all services, including Neon, GitHub, Cloudinary, and Vercel.
