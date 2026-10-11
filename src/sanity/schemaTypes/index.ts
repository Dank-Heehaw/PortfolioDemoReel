import { archiveImage } from "./archive";
import { journalPost } from "./journal";
import { project } from "./project";
import { siteSettings } from "./settings";

export const schemaTypes = [project, journalPost, archiveImage, siteSettings];
