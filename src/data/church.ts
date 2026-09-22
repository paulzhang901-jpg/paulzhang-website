import {socialProfiles} from "@/data/social-links";

export const churchProfile = {
  name: "The First Chinese Free Methodist Church of Indianapolis",
  abbreviation: "FCFMC",
  conference: "Crossroads Conference",
  gatheringLocation: {
    street: "6042 W 100 N",
    cityRegionPostal: "Greenfield, IN 46140",
  },
  website: socialProfiles.churchWebsite,
  youtube: socialProfiles.churchYoutube,
} as const;
