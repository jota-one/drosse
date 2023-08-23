import { defineDrosseService } from "../../../src";
import {readBody, readMultipartFormData} from "h3";

export default defineDrosseService(async ({ event, io }) => {
  const document = (await readBody(event) || [])
  const filepath = await io.writeUploadedFile(`${Date.now()}-random-name`, document)
  return filepath
})
