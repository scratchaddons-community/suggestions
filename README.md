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
- Icons from [https://icones.js.org/collection/material-symbols](https://icones.js.org/collection/material-symbols), standardized to the rounded option, and a width and height of 1em (you may need to manually set this)
- By default this repo uses AUSTRALIAN English. I am Aussie, get used to it

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

- [ ] Rewrite the services section to differentiate instructions between production and development
- [ ] Replace all alerts with toasts (both blocking and non-blocking) - [why?](https://www.telerik.com/blogs/how-to-do-javascript-alerts-without-being-a-jerk)
- [x] Add Upstash to the privacy policy
- [ ] Add a new display mode to show more suggestions compactly
- [x] Find a way to improve performance? I'm sure my database queries suck
- [x] This includes streaming of data on main page, and not invalidating data on nav to account or add suggestion, i think cuz in the page load it checks for the user from locals
- [x] ...actually allow users to add suggestions
- [x] That includes images Jazza!! - Probably cloudinary or imagekit
- [ ] Add tips on making a good suggestion
- [ ] Make suggestions be openable
- [ ] Add manual verification for github accounts - these are for devs only
- [ ] Permissions such as admin roles
- [ ] Infinite scrolling?
- [ ] Add linking to other suggestions when marking as a dupe
- [ ] Add page numbers
- [ ] Add search params for things like pages, sorting, etc
- [ ] Basic image editing such as cropping or adding arrows and circles?
- [ ] Add a status for what version something is being added in.
- [ ] Compact mode, remove images and less useful info
- [x] Client side compression

## Services

You will need the following services for development and/or production:

- [Neon](https://neon.tech/)
- [Upstash](https://upstash.com/)
- [A GitHub OAuth application x2](https://github.com/settings/applications/new)
- [Cloudinary](https://cloudinary.com/)

I'll do this later, rn I'm emotional, hungry, and tired. Future me, give instructions on how to set up the services for both ## Development and ## Production. Specify stuff like OAuth x2 because of the callback url.

## Other

~~I recommend setting on cloudinary an incoming transformation that will essentially limit the size of the image and set the format and quality to something reasonable. This WILL cost you a transform for every uploaded image, but it will also reduce the file size that you need to store.~~ I have instead implemented client side compression, which saves not only a transformation, but also a lot of bandwidth, for cloudinary, and the user, making large images upload MUCH faster. This IS client side, which means it can be bypassed if the client code is modified, but there is still a server side enforced limit of 10MB, and a max of 5 images per suggestion. I will keep the thumbnail generation in cloudinary, as that is something which is important to be enforced.

`c_limit/if_w_gt_600/w_600/if_end/f_avif/q_auto:low/if_h_gt_4000/h_4000/if_end` - Thumbnail transformation, update the "getTransformedResolutions" function if you change this transformation, which is found in [src/lib/cloudinary/url.ts](src/lib/cloudinary/url.ts).

I also recommend deploying this project to **[Vercel](https://vercel.com/)** for production, as I have had issues with Cloudflare Pages. This may have been fixed by now, as I recently removed the Cloudinary package from the images test, which was not runtime agnostic. However, it seems that the postgres package I am using is NOT runtime agnostic.

With the expected usage of this project, this should be able to run on free tiers of all services, including Neon, GitHub, Cloudinary, and Vercel.
