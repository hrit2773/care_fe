import { useQuery } from "@tanstack/react-query";
import { t } from "i18next";
import { useNavigate } from "raviger";

import { cn } from "@/lib/utils";

import CareIcon from "@/CAREUI/icons/CareIcon";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { TableSkeleton } from "@/components/Common/SkeletonLoading";

import useFilters from "@/hooks/useFilters";

import query from "@/Utils/request/query";
import { QuestionnaireDetail } from "@/types/questionnaire/questionnaire";
import questionnaireApi from "@/types/questionnaire/questionnaireApi";

function EmptyState() {
  return (
    <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
      <div className="rounded-full bg-primary/10 p-3 mb-4">
        <CareIcon icon="l-folder-open" className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-1">
        {t("no_questionnaires_found")}
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        {t("adjust_questionnaire_filters")}
      </p>
    </Card>
  );
}

export function QuestionnaireList() {
  const { qParams, updateQuery, Pagination, resultsPerPage } = useFilters({
    limit: 15,
    cacheBlacklist: ["title"],
  });
  const { status, title } = qParams;
  const navigate = useNavigate();
  const { data: response, isLoading } = useQuery({
    queryKey: ["questionnaires", qParams],
    queryFn: query.debounced(questionnaireApi.list, {
      queryParams: {
        status,
        title,
        limit: resultsPerPage,
        offset: ((qParams.page ?? 1) - 1) * resultsPerPage,
      },
    }),
  });

  const statusTabs = [
    {
      value: "all",
      label: t("all"),
    },
    {
      value: "active",
      label: t("active"),
    },
    {
      value: "draft",
      label: t("draft"),
    },
    {
      value: "retired",
      label: t("retired"),
    },
  ];

  const questionnaireList = response?.results || [];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("questionnaires")}</h1>
          <p className="text-gray-600">{t("manage_and_view_questionnaires")}</p>
        </div>
        <Button onClick={() => navigate("/admin/questionnaire/create")}>
          {t("create_new")}
        </Button>
      </div>

      <div className="flex flex-wrap items-center my-2 gap-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 min-w-[7.5rem] justify-start",
                title && "bg-primary/10 text-primary hover:bg-primary/20",
              )}
            >
              <CareIcon icon="l-search" className="mr-2 h-4 w-4" />
              {title ? <span className="truncate">{title}</span> : t("search")}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[calc(100vw-7rem)] max-w-sm p-3"
            align="start"
            onEscapeKeyDown={(event) => event.preventDefault()}
          >
            <div className="space-y-4">
              <h4 className="font-medium leading-none">
                {t("search_questionnaire")}
              </h4>
              <Input
                id="questionnaire-search"
                type="text"
                placeholder={t("search_by_questionnaire_title")}
                value={title}
                onChange={(event) =>
                  updateQuery({
                    status,
                    title: event.target.value,
                  })
                }
              />
            </div>
          </PopoverContent>
        </Popover>
        <div className="items-center">
          <Tabs value={status || "all"} className="w-full">
            <TabsList className="bg-transparent p-0 h-8">
              {statusTabs.map(({ value, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  onClick={() =>
                    updateQuery({
                      status: value !== "all" ? value : undefined,
                      title,
                    })
                  }
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        {isLoading ? (
          <TableSkeleton count={8} />
        ) : questionnaireList.length === 0 ? (
          <EmptyState />
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("title")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("description")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("status")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("slug")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {questionnaireList.map((questionnaire: QuestionnaireDetail) => (
                <tr
                  key={questionnaire.id}
                  onClick={() =>
                    navigate(`/questionnaire/${questionnaire.slug}`)
                  }
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {questionnaire.title}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-md truncate text-sm text-gray-900">
                      {questionnaire.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      className={
                        questionnaire.status === "active"
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : ""
                      }
                    >
                      {questionnaire.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {questionnaire.slug}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Pagination totalCount={response?.count ?? 0} />
    </div>
  );
}
