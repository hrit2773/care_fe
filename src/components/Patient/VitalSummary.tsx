import careConfig from "@careConfig";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

import PrintPreview from "@/CAREUI/misc/PrintPreview";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ObservationPlotConfig } from "@/components/Common/Charts/ObservationChart";

import api from "@/Utils/request/api";
import routes from "@/Utils/request/api";
import query from "@/Utils/request/query";
import { formatName, formatPatientAge } from "@/Utils/utils";
import { ObservationAnalyzeResponse } from "@/types/emr/observation";

interface VitalSummaryProps {
  facilityId: string;
  encounterId: string;

  patientId: string;
}

const Section = ({
  children,
  title,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <Card className="rounded-sm shadow-none border-none">
      <CardHeader className="flex justify-between flex-row px-0 py-2 ">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-0 py-0">{children}</CardContent>
    </Card>
  );
};

export default function VitalSummary({
  facilityId,
  encounterId,
  patientId,
}: VitalSummaryProps) {
  const { t } = useTranslation();

  const { data } = useQuery<ObservationPlotConfig>({
    queryKey: ["plots-config"],
    queryFn: () => fetch(careConfig.plotsConfigUrl).then((res) => res.json()),
  });

  const allCodes = data
    ?.find((tab) => tab.id === "primary-parameters")
    ?.groups.flatMap((group) => group.codes);

  const { data: observations } = useQuery<ObservationAnalyzeResponse>({
    queryKey: [
      "observations",
      patientId,
      encounterId,
      allCodes?.map((c) => c.code).join(","),
    ],
    queryFn: query(routes.observationsAnalyse, {
      pathParams: { patientId },
      queryParams: {
        encounter: encounterId,
      },
      body: {
        codes: allCodes,
      },
    }),
  });
  console.log(observations);
  const { data: encounter } = useQuery({
    queryKey: ["encounter", encounterId],
    queryFn: query(api.encounter.get, {
      pathParams: { id: encounterId },
      queryParams: { facility: facilityId },
    }),
    enabled: !!encounterId && !!facilityId,
  });

  if (!encounter) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-lg border-2 border-dashed p-4 text-gray-500">
        {t("no_patient_record_found")}
      </div>
    );
  }

  return (
    <PrintPreview title={`${t("vitals_summary")} - ${encounter.patient.name}`}>
      <div className="min-h-screen py-2 max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start pb-2 border-b">
            <div className="space-y-4 flex-1">
              <div>
                <h1 className="text-3xl font-semibold">
                  {encounter.facility.name}
                </h1>
                <h2 className="text-gray-500 uppercase text-sm tracking-wide font-semibold mt-1">
                  {t("vitals_summary")}
                </h2>
              </div>
            </div>
            <img
              src={careConfig.mainLogo?.dark}
              alt="Care Logo"
              className="h-10 w-auto object-contain ml-6"
            />
          </div>
          {/* Patient Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <div className="space-y-3">
              <div className="grid grid-cols-[10rem,auto,1fr] md:grid-cols-[8rem,auto,1fr] items-center">
                <span className="text-gray-600">{t("patient")}</span>
                <span className="text-gray-600">:</span>
                <span className="font-semibold break-words">
                  {encounter.patient.name}
                </span>
              </div>
              <div className="grid grid-cols-[10rem,auto,1fr] md:grid-cols-[8rem,auto,1fr] items-center">
                <span className="text-gray-600">{`${t("age")} / ${t("sex")}`}</span>
                <span className="text-gray-600">:</span>
                <span className="font-semibold break-words">
                  {`${formatPatientAge(encounter.patient, true)}, ${t(`GENDER__${encounter.patient.gender}`)}`}
                </span>
              </div>
              <div className="grid grid-cols-[10rem,auto,1fr] md:grid-cols-[8rem,auto,1fr] items-center">
                <span className="text-gray-600">{t("encounter_class")}</span>
                <span className="text-gray-600">:</span>
                <span className="font-semibold">
                  {t(`encounter_class__${encounter.encounter_class}`)}
                </span>
              </div>
              <div className="grid grid-cols-[10rem,auto,1fr] md:grid-cols-[8rem,auto,1fr] items-center">
                <span className="text-gray-600">{t("priority")}</span>
                <span className="text-gray-600">:</span>
                <span className="font-semibold">
                  {t(`encounter_priority__${encounter.priority}`)}
                </span>
              </div>

              {encounter.hospitalization?.admit_source && (
                <div className="grid grid-cols-[10rem,auto,1fr] md:grid-cols-[8rem,auto,1fr] items-center">
                  <span className="text-gray-600">{t("admission_source")}</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-semibold">
                    {t(
                      `encounter_admit_sources__${encounter.hospitalization.admit_source}`,
                    )}
                  </span>
                </div>
              )}
              {encounter.hospitalization?.re_admission && (
                <div className="grid grid-cols-[10rem,auto,1fr] md:grid-cols-[8rem,auto,1fr] items-center">
                  <span className="text-gray-600">{t("readmission")}</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-semibold">{t("yes")}</span>
                </div>
              )}
              {encounter.hospitalization?.diet_preference && (
                <div className="grid grid-cols-[10rem,auto,1fr] md:grid-cols-[8rem,auto,1fr] items-center">
                  <span className="text-gray-600">{t("diet_preference")}</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-semibold">
                    {t(
                      `encounter_diet_preference__${encounter.hospitalization.diet_preference}`,
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <div className="grid grid-cols-[10rem,auto,1fr] md:grid-cols-[8rem,auto,1fr] items-center">
                <span className="text-gray-600">{t("mobile_number")}</span>
                <span className="text-gray-600">:</span>
                <span className="font-semibold break-words">
                  {encounter.patient.phone_number}
                </span>
              </div>

              {encounter.period.start && (
                <div className="grid grid-cols-[10rem,auto,1fr] md:grid-cols-[8rem,auto,1fr] items-center">
                  <span className="text-gray-600">{t("encounter_date")}</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-semibold">
                    {format(
                      new Date(encounter.period.start),
                      "dd MMM yyyy, EEEE",
                    )}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-[10rem,auto,1fr] md:grid-cols-[8rem,auto,1fr] items-center">
                <span className="text-gray-600">{t("status")}</span>
                <span className="text-gray-600">:</span>
                <span className="font-semibold">
                  {t(`encounter_status__${encounter.status}`)}
                </span>
              </div>

              <div className="grid grid-cols-[10rem,auto,1fr] md:grid-cols-[8rem,auto,1fr] items-center">
                <span className="text-gray-600">{t("consulting_doctor")}</span>
                <span className="text-gray-600">:</span>
                <span className="font-semibold">
                  {formatName(encounter.created_by)}
                </span>
              </div>

              {encounter.external_identifier && (
                <div className="grid grid-cols-[10rem,auto,1fr] md:grid-cols-[8rem,auto,1fr] items-center">
                  <span className="text-gray-600">{t("external_id")}</span>
                  <span className="text-gray-600">:</span>
                  <span className="font-semibold">
                    {encounter.external_identifier}
                  </span>
                </div>
              )}

              {encounter.hospitalization?.discharge_disposition && (
                <div className="grid grid-cols-[10rem,auto,1fr] md:grid-cols-[8rem,auto,1fr] items-center">
                  <span className="text-gray-600">
                    {t("discharge_disposition")}
                  </span>
                  <span className="text-gray-600">:</span>
                  <span className="font-semibold">
                    {t(
                      `encounter_discharge_disposition__${encounter.hospitalization.discharge_disposition}`,
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
          <Section title={t("vitals")}>
            <div>vital</div>
          </Section>
        </div>
      </div>
    </PrintPreview>
  );
}
