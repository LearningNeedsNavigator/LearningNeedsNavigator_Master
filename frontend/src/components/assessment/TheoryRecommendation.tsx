
import React from "react";
import { LearningTheory, LearningTheoryDescription } from "@/types/assessment";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type TheoryRecommendationProps = {
  theory: LearningTheory;
  description: LearningTheoryDescription;
  score: number;
  isPrimary?: boolean;
};

const TheoryRecommendation = ({ 
  theory, 
  description, 
  score, 
  isPrimary = false 
}: TheoryRecommendationProps) => {
  return (
    <Card className={isPrimary ? "border-primary" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {theory}
            {isPrimary && <Badge variant="default">Primary Recommendation</Badge>}
          </CardTitle>
          <div className="text-lg font-medium">{score.toFixed(1)}%</div>
        </div>
        <CardDescription>{description.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Best Practices</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {description.bestPractices.map((practice, index) => (
                <li key={index}>{practice}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Recommended Metrics</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {description.metrics.map((metric, index) => (
                <li key={index}>{metric}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">When to Use</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {description.whenToUse.map((use, index) => (
                <li key={index}>{use}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TheoryRecommendation;
