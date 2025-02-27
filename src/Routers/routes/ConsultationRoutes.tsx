import QuestionnaireResponseView from "@/components/Facility/ConsultationDetails/QuestionnaireResponseView";
import EncounterQuestionnaire from "@/components/Patient/EncounterQuestionnaire";
import TreatmentSummary from "@/components/Patient/TreatmentSummary";

import { AppRoutes } from "@/Routers/AppRouter";
import { EncounterShow } from "@/pages/Encounters/EncounterShow";
import { PrintPrescription } from "@/pages/Encounters/PrintPrescription";

const consultationRoutes: AppRoutes = {
  "/facility/:facilityId/patient/:patientId/encounter/:encounterId/prescriptions/print":
    ({ facilityId, encounterId, patientId }) => (
      <PrintPrescription
        facilityId={facilityId}
        encounterId={encounterId}
        patientId={patientId}
      />
    ),
  "/facility/:facilityId/patient/:patientId/encounter/:encounterId/treatment_summary":
    ({ facilityId, encounterId, patientId }) => (
      <TreatmentSummary
        facilityId={facilityId}
        encounterId={encounterId}
        patientId={patientId}
      />
    ),
  "/facility/:facilityId/patient/:patientId/encounter/:encounterId/questionnaire":
    ({ facilityId, encounterId, patientId }) => (
      <EncounterQuestionnaire
        facilityId={facilityId}
        encounterId={encounterId}
        patientId={patientId}
      />
    ),
  "/facility/:facilityId/patient/:patientId/encounter/:encounterId/questionnaire/:slug":
    ({ facilityId, encounterId, slug, patientId }) => (
      <EncounterQuestionnaire
        facilityId={facilityId}
        encounterId={encounterId}
        questionnaireSlug={slug}
        patientId={patientId}
      />
    ),
  "/facility/:facilityId/patient/:patientId/encounter/:encounterId/questionnaire_response/:id":
    ({ patientId, id }) => (
      <QuestionnaireResponseView responseId={id} patientId={patientId} />
    ),
  "/facility/:facilityId/patient/:patientId/encounter/:encounterId/:tab": ({
    facilityId,
    patientId,
    encounterId,
    tab,
  }) => (
    <EncounterShow
      facilityId={facilityId}
      patientId={patientId}
      encounterId={encounterId}
      tab={tab}
    />
  ),
  "/facility/:facilityId/patient/:patientId/encounter/:encounterId/:tab/:subPage":
    ({ facilityId, encounterId, patientId, tab, subPage }) => (
      <EncounterShow
        facilityId={facilityId}
        patientId={patientId}
        encounterId={encounterId}
        tab={tab}
        subPage={subPage}
      />
    ),
  "/facility/:facilityId/patient/:patientId/consultation": ({
    facilityId,
    patientId,
  }) => (
    <EncounterQuestionnaire
      facilityId={facilityId}
      patientId={patientId}
      questionnaireSlug="encounter"
    />
  ),
  "/facility/:facilityId/patient/:patientId/questionnaire": ({
    facilityId,
    patientId,
  }) => (
    <EncounterQuestionnaire
      facilityId={facilityId}
      patientId={patientId}
      subjectType="patient"
    />
  ),
};

export default consultationRoutes;
