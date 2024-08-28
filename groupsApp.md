# Running the Groups app

> [!NOTE]
> This is a work in progress. Routes unrelated to Groups (e.g. `/team`) can
> still be accessed directly.

## Background

This project was written primarily with the focus of internal management and
deployment to https://nextstrain.org. However, we recognize the need for some
institutions to host and manage their own instance of the site, specifically
just the Groups service. To facilitate this type of deployment, we have updated
the different parts of the project to be more configurable and created an
alternative application entrypoint to run just the Groups parts of the website.

## Usage

1. Clone the repository.
2. Configure the server's environment: modify files in `env/testing/` and/or
   `env/production/`, specifically the `config.json` and `groups.json` files.
3. Customize the `static-site`:
    1. Set `groupsApp` to `true` in `static-site/data/BaseConfig.js`.
    2. Change other values in that file and in `static-site/data/SiteConfig.jsx`.
4. Customize the `auspice-client`:
    1. Change the title in `auspice-client/customisations/config.json`.
    2. Change the `NavBar` component's links in `auspice-client/customisations/navbar.js`.
    3. Change the `ErrorMessage` component's text in
       `auspice-client/customisations/splash.js`. Note that we only expect the
       splash page to be shown when there is a bug on the Nextstrain side.
5. Build the application with `npm run build`.
6. Run the application with `npm run groups`.

When running in production, please refer to the relevant [doc
page](https://docs.nextstrain.org/projects/nextstrain-dot-org/page/production.html).
