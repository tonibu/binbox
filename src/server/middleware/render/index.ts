import fs from "node:fs";
import sqrl from "squirrelly";

import type { RequestHandler } from "express";
type Options = { htmlPath: string };

const renderMiddleware = async ({
  htmlPath,
}: Options): Promise<RequestHandler> => {
  const htmlTemplate = (await fs.promises.readFile(htmlPath)).toString();

  return (_, res) => {
    const templateOptions = {
      env: process.env.NODE_ENV,
      accessToken: res.locals.accessToken,
      vite: {
        port: process.env.VITE_DEV_PORT,
      },
    };

    const html = sqrl.render(htmlTemplate, templateOptions);

    res.setHeader("content-type", "text/html");
    res.send(html);
  };
};

export default renderMiddleware;
