import { Status } from "./Status";

export interface Pet {
  id?: string;
  name: string;
  status: Status;
  photoUrls: string[];
  category: {id: number, name: string};
}
