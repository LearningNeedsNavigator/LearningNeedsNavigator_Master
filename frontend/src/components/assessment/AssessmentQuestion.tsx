
import React, { useState, useEffect } from "react";
import { Question, UserResponse } from "@/types/assessment";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import MicButton from "./MicButton";
import ChatInput from "./ChatInput";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const QuestionTitle = ({ text, helpText }: { text: string; helpText?: string }) => (
  <span className="inline-flex items-start gap-2">
    <span>{text}</span>
    {helpText && (
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="More information"
              className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs text-sm leading-relaxed">
            {helpText}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}
  </span>
);

type AssessmentQuestionProps = {
  question: Question;
  response?: UserResponse;
  onResponseChange: (response: UserResponse) => void;
};

const AssessmentQuestion = ({ question, response, onResponseChange }: AssessmentQuestionProps) => {
  const [showOtherInput, setShowOtherInput] = useState(response?.selectedOptionId === "other");
  const [otherText, setOtherText] = useState(response?.customText || "");
  const [textInputValue, setTextInputValue] = useState(response?.customText || "");
  const [selectedOptions, setSelectedOptions] = useState<string[]>(response?.selectedOptionIds || []);
  const [touched, setTouched] = useState(false);
  
  // Effect to update state when response prop changes
  useEffect(() => {
    setOtherText(response?.customText || "");
    setTextInputValue(response?.customText || "");
    if (response?.selectedOptionIds) {
      setSelectedOptions(response.selectedOptionIds);
    }
  }, [response?.customText, response?.selectedOptionIds]);
  
  const handleOptionChange = (optionId: string) => {
    const isOtherOption = optionId === "other";
    setShowOtherInput(isOtherOption);
    
    // Create the response object
    const responseObject: UserResponse = {
      questionId: question.id,
      selectedOptionId: optionId,
      value: isOtherOption ? 3 : // Default middle value for "Other"
        (question.options?.find(o => o.id === optionId)?.value || 0)
    };
    
    // Add custom text if it's the "Other" option
    if (isOtherOption && otherText.trim()) {
      responseObject.customText = otherText;
    }
    
    onResponseChange(responseObject);
  };
  
  const handleOtherTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setOtherText(newText);
    
    // Only update the response if "Other" is already selected
    if (response?.selectedOptionId === "other") {
      onResponseChange({
        ...response,
        customText: newText
      });
    }
  };
  
  const handleTextInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setTextInputValue(newText);
    
    onResponseChange({
      questionId: question.id,
      value: newText.trim() ? 3 : 0, // Default middle value if there's text, otherwise 0
      customText: newText
    });
  };

  const handleCheckboxChange = (optionId: string, checked: boolean) => {
    let newSelectedOptions: string[];
    
    if (checked) {
      newSelectedOptions = [...selectedOptions, optionId];
    } else {
      newSelectedOptions = selectedOptions.filter(id => id !== optionId);
    }
    
    setSelectedOptions(newSelectedOptions);
    
    // Calculate value based on the highest value option selected
    let maxValue = 0;
    newSelectedOptions.forEach(id => {
      const optionValue = question.options?.find(o => o.id === id)?.value || 0;
      maxValue = Math.max(maxValue, optionValue);
    });
    
    onResponseChange({
      questionId: question.id,
      selectedOptionIds: newSelectedOptions,
      value: maxValue
    });
  };

  // Render single-line short text question (structured capture fields)
  if (question.type === "shortText") {
    const trimmed = textInputValue.trim();
    const showError = question.required && touched && !trimmed;
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">
            <QuestionTitle text={question.text} helpText={question.helpText} />
            {question.required && <span className="ml-1 text-destructive">*</span>}
          </CardTitle>
          {question.helperText && <CardDescription>{question.helperText}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex max-w-xl gap-2 items-center">
            <Input
              id={question.id}
              type="text"
              inputMode="text"
              value={textInputValue}
              placeholder={question.placeholder || "Type your answer..."}
              aria-invalid={showError || undefined}
              aria-describedby={showError ? `${question.id}-error` : undefined}
              onBlur={() => setTouched(true)}
              onChange={(e) => {
                const newText = e.target.value;
                setTextInputValue(newText);
                onResponseChange({
                  questionId: question.id,
                  value: 0,
                  customText: newText,
                });
              }}
              className="flex-1"
            />
            <MicButton
              currentValue={textInputValue}
              onTranscript={(newText) => {
                setTextInputValue(newText);
                onResponseChange({
                  questionId: question.id,
                  value: 0,
                  customText: newText,
                });
              }}
            />
          </div>
          {question.examples && question.examples.length > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Examples: {question.examples.map((ex) => `"${ex}"`).join(", ")}
            </p>
          )}
          {showError && (
            <p id={`${question.id}-error`} className="mt-2 text-sm text-destructive">
              {question.validationMessage || "This field is required."}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Render text input question
  if (question.type === "textInput") {
    return (
      <Card className="w-full border-none shadow-none bg-transparent">
        <CardHeader className="px-1">
          <CardTitle className="text-xl">
            <QuestionTitle text={question.text} helpText={question.helpText} />
          </CardTitle>
        </CardHeader>
        <CardContent className="px-1">
          <ChatInput
            value={textInputValue}
            placeholder="Type or speak your response..."
            onChange={(newText) => {
              setTextInputValue(newText);
              onResponseChange({
                questionId: question.id,
                value: newText.trim() ? 3 : 0,
                customText: newText,
              });
            }}
          />
        </CardContent>
      </Card>
    );
  }

  // Render multiple answer question
  if (question.type === "multipleAnswer") {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">
            <QuestionTitle text={question.text} helpText={question.helpText} />
          </CardTitle>
          <CardDescription>Select all that apply</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {question.options?.map(option => (
              <div key={option.id} className="flex items-start space-x-2">
                <Checkbox 
                  id={option.id}
                  checked={selectedOptions.includes(option.id)}
                  onCheckedChange={(checked) => {
                    handleCheckboxChange(option.id, checked === true);
                  }}
                  className="mt-1"
                />
                <Label htmlFor={option.id} className="text-base cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
            
            {/* "Other" option */}
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="other"
                  checked={selectedOptions.includes("other")}
                  onCheckedChange={(checked) => {
                    handleCheckboxChange("other", checked === true);
                    setShowOtherInput(checked === true);
                  }}
                  className="mt-1"
                />
                <Label htmlFor="other" className="text-base cursor-pointer">
                  Other
                </Label>
              </div>
              
              {showOtherInput && (
                <div className="ml-6 mt-2">
                  <div className="flex gap-2 items-center max-w-md">
                    <Input
                      type="text"
                      placeholder="Please specify..."
                      value={otherText}
                      onChange={handleOtherTextChange}
                      className="flex-1"
                    />
                    <MicButton
                      currentValue={otherText}
                      onTranscript={(newText) => {
                        setOtherText(newText);
                        if (selectedOptions.includes("other")) {
                          let maxValue = 0;
                          selectedOptions.forEach(id => {
                            const optionValue = question.options?.find(o => o.id === id)?.value || 0;
                            maxValue = Math.max(maxValue, optionValue);
                          });
                          onResponseChange({
                            questionId: question.id,
                            selectedOptionIds: selectedOptions,
                            value: maxValue,
                            customText: newText,
                          });
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render multiple choice question
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">
          <QuestionTitle text={question.text} helpText={question.helpText} />
        </CardTitle>
        <CardDescription>Select the most appropriate option</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={response?.selectedOptionId}
          onValueChange={handleOptionChange}
          className="space-y-3"
        >
          {question.options?.map(option => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem value={option.id} id={option.id} />
              <Label htmlFor={option.id} className="text-base">
                {option.text}
              </Label>
            </div>
          ))}
          
          {/* Add "Other" option */}
          {question.allowOther !== false && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other" className="text-base">
                Other
              </Label>
            </div>
            
            {showOtherInput && (
              <div className="ml-6 mt-2">
                <div className="flex gap-2 items-center max-w-md">
                  <Input
                    type="text"
                    placeholder="Please specify..."
                    value={otherText}
                    onChange={handleOtherTextChange}
                    className="flex-1"
                  />
                  <MicButton
                    currentValue={otherText}
                    onTranscript={(newText) => {
                      setOtherText(newText);
                      if (response?.selectedOptionId === "other") {
                        onResponseChange({
                          ...response,
                          customText: newText,
                        });
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          )}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default AssessmentQuestion;
