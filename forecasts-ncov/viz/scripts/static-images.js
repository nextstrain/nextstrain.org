// require fs and puppeteer
const argparse = require("argparse");
const fs = require("fs");
const puppeteer = require("puppeteer");
const path = require('path')
const express = require('express')


function parseArgs() {
  const parser = new argparse.ArgumentParser({
    description: `
      Spin up the Nextstrain forecasts-ncov viz app to capture screenshots of
      the D3 visualizations for model results.
    `,
  });

  parser.add_argument("--output-dir", {
    default: "figures",
    dest: "outputDir",
    help: "Output directory for screenshots."
  });

  return parser.parse_args();
}

const elementsToScreenshot = [
  "frequenciesPanel",
  "rtPanel",
  "smoothedIncidencePanel",
  "growthAdvantagePanel",
];

async function captureScreenshot(dir) {

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  let browser = null;

  try {
    browser = await puppeteer.launch({ headless: true });

    const page = await browser.newPage();

    await page.setViewport({ width: 1440, height: 1080 });

    await page.goto("http://localhost:3000");

    await page.waitForSelector('#mainPanelsContainer', {visible: true})

    await page.waitForTimeout(5000); // bad - should check the d3 is rendered not this!
    console.log("Page rendered")

    /* save each panel (of small multiples) as a .png image */
    for (const id of elementsToScreenshot) {
      console.log(`Finding & saving ${id}`)
      const panel = await page.$(`#${id}`);
      await panel.screenshot({ path: `${dir}/${id}.png` });
    }

    /* proof-of-principle for how to generate the PDF */
    const pdfConfig = {
      path: `${dir}/testing.pdf`,
      format: 'A4',
      printBackground: false,
    };
    await page.pdf(pdfConfig);

    /* legend is a bit different, as we want to control the layout of it */
    console.log("Changing page size & saving the legend")
    await page.setViewport({ width: 800, height: 1080 });
    const panel = await page.$(`#legend`);
    await panel.screenshot({ path: `${dir}/legend.png` });


  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
  } finally {
    await browser.close();
    console.log(`\n🎉 success`);
  }
}

async function startServer() {
  const app = express()
  app.set('port', 3000);
  app.use("/", express.static(path.join(__dirname, '..', "build")))
  app.use('/forecasting-viz-asset', express.static(path.join(__dirname, '..', "build", "forecasting-viz-assets")))
  const server = await app.listen(app.get('port'));
  console.log(`Ephemeral server running at port ${app.get('port')}`)
  return server;
}

async function main({outputDir}) {
  const server = await startServer();
  await captureScreenshot(outputDir);
  server.close();
}

main(parseArgs());

