import { useQuery } from "@tanstack/react-query";
import { memo, useState } from "react";

import Autocomplete from "@/components/ui/autocomplete";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import routes from "@/Utils/request/api";
import query from "@/Utils/request/query";
import { properCase } from "@/Utils/utils";
import type {
  QuestionnaireResponse,
  ResponseValue,
} from "@/types/questionnaire/form";
import type { AnswerOption, Question } from "@/types/questionnaire/question";

interface ChoiceQuestionProps {
  question: Question;
  questionnaireResponse: QuestionnaireResponse;
  updateQuestionnaireResponseCB: (
    values: ResponseValue[],
    questionId: string,
    note?: string,
  ) => void;
  disabled?: boolean;
  withLabel?: boolean;
  clearError: () => void;
  index?: number;
}

function ValuesetAutoComplete(props: { valueset: string }) {
  const [search, setSearch] = useState("");

  const fetchValuesetOptions = useQuery({
    queryKey: ["valueset", props.valueset, "expand", search],
    queryFn: query.debounced(routes.valueset.expand, {
      pathParams: { system: props.valueset },
      body: { search, count: 10 },
    }),
  });
  return (
    <Autocomplete
      options={
        fetchValuesetOptions.data?.results.map((option) => {
          return {
            label: option.display!,
            value: option.code,
          };
        }) || []
      }
      value={search}
      onChange={(value: string) => setSearch(value)}
    />
  );
}

export const ChoiceQuestion = memo(function ChoiceQuestion({
  question,
  questionnaireResponse,
  updateQuestionnaireResponseCB,
  disabled = false,
  clearError,
  index = 0,
}: ChoiceQuestionProps) {
  if (question.answer_value_set) {
    return <ValuesetAutoComplete valueset={question.answer_value_set} />;
  }
  const options = question.answer_option || [];
  const currentValue = questionnaireResponse.values[index]?.value?.toString();
  const handleValueChange = (newValue: string) => {
    clearError();
    const newValues = [...questionnaireResponse.values];
    newValues[index] = {
      type: "string",
      value: newValue,
    };

    updateQuestionnaireResponseCB(
      newValues,
      questionnaireResponse.question_id,
      questionnaireResponse.note,
    );
  };

  return (
    <Select
      value={currentValue}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option: AnswerOption) => (
          <SelectItem
            key={option.value.toString()}
            value={option.value.toString()}
          >
            {properCase(option.display || option.value)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});
