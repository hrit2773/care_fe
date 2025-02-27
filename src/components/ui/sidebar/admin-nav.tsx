import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import { NavMain } from "@/components/ui/sidebar/nav-main";

interface NavigationLink {
  name: string;
  url: string;
  icon?: string;
}

function generateAdminLinks(t: TFunction) {
  const baseUrl = "/admin";
  const links: NavigationLink[] = [
    {
      name: t("questionnaire"),
      url: `${baseUrl}/questionnaire`,
      icon: "d-book-open",
    },
    {
      name: "Valuesets",
      url: `${baseUrl}/valuesets`,
      icon: "l-list-ol-alt",
    },
  ];

  return links;
}

export function AdminNav() {
  const { t } = useTranslation();
  return <NavMain links={generateAdminLinks(t)} />;
}
