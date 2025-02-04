import fs from "node:fs";
import sqrl from "squirrelly";

import type { RequestHandler } from "express";
type Options = { htmlPath: string };

const renderMiddleware = async ({
  htmlPath,
}: Options): Promise<RequestHandler> => {
  const htmlTemplate = (await fs.promises.readFile(htmlPath)).toString();

  const templateOptions = {
    env: process.env.NODE_ENV,
    vite: {
      port: process.env.VITE_DEV_PORT,
    },
  };

  return (_, res) => {
    const html = sqrl.render(htmlTemplate, templateOptions);

    res.setHeader("content-type", "text/html");
    res.send(html);
  };
};

export default renderMiddleware;
