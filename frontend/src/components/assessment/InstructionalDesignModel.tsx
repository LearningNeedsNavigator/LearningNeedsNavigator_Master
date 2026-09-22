
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IDModel } from "@/types/assessment";

type InstructionalDesignModelProps = {
  model: IDModel;
  isPrimary?: boolean;
};

const InstructionalDesignModel = ({ 
  model, 
  isPrimary = false 
}: InstructionalDesignModelProps) => {
  return (
    <Card className={isPrimary ? "border-primary" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {model.name}
            {isPrimary && <Badge variant="default">Primary Recommendation</Badge>}
          </CardTitle>
          <div className="text-lg font-medium">{model.alignmentScore.toFixed(1)}%</div>
        </div>
        <CardDescription>{model.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Key Characteristics</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {model.characteristics.map((characteristic, index) => (
                <li key={index}>{characteristic}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">When To Use</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {model.whenToUse.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Implementation Steps</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              {model.implementationSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Aligned Learning Theories</h4>
            <div className="flex flex-wrap gap-2">
              {model.alignedTheories.map((theory, index) => (
                <Badge key={index} variant="outline" className="bg-accent/30">
                  {theory}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstructionalDesignModel;
