/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heart, Shield, Send, BarChart, TrendingUp } from "lucide-react";
import { useState } from "react";
import { EmployeePortalLayout } from "@/components/layouts/EmployeePortalLayout";
import { submitSurvey } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function WellbeingSurvey({ showResults = false, surveyResults = [] }: { showResults?: boolean, surveyResults?: any[] }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [notifyHR, setNotifyHR] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [form, setForm] = useState<any>({});

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // Remove hardcoded surveyHistory and trend data

  const handleRadioChange = (name: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };
  const handleCheckboxChange = (name: string, value: string, checked: boolean) => {
    setForm((prev: any) => ({
      ...prev,
      [name]: Array.isArray(prev[name])
        ? checked
          ? [...prev[name], value]
          : prev[name].filter((v: string) => v !== value)
        : checked
        ? [value]
        : [],
    }));
  };
  const handleTextareaChange = (name: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      await submitSurvey({ surveyData: { ...form, notifyHR } });
      setSubmitSuccess(true);
      setCurrentStep(1);
      setForm({});
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit survey");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('employee.wellbeingSurvey.overallWellbeing')}</h3>
              <RadioGroup value={form.overall || ""} onValueChange={v => handleRadioChange("overall", v)}>
                {[...Array(10)].map((_, i) => (
                  <div key={i + 1} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={String(i + 1)}
                      id={`overall-${i + 1}`}
                    />
                    <Label htmlFor={`overall-${i + 1}`} className="flex-1">
                      {i + 1} - {i < 3 ? "Poor" : i < 6 ? "Fair" : i < 8 ? "Good" : "Excellent"}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('employee.wellbeingSurvey.workLifeBalance')}</h3>
              <RadioGroup value={form.workLife || ""} onValueChange={v => handleRadioChange("workLife", v)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excellent" id="wlb-excellent" />
                  <Label htmlFor="wlb-excellent">{t('employee.wellbeingSurvey.excellent')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="good" id="wlb-good" />
                  <Label htmlFor="wlb-good">{t('employee.wellbeingSurvey.good')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fair" id="wlb-fair" />
                  <Label htmlFor="wlb-fair">{t('employee.wellbeingSurvey.fair')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="poor" id="wlb-poor" />
                  <Label htmlFor="wlb-poor">{t('employee.wellbeingSurvey.poor')}</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('employee.wellbeingSurvey.stressLevel')}</h3>
              <RadioGroup value={form.stress || ""} onValueChange={v => handleRadioChange("stress", v)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="stress-low" />
                  <Label htmlFor="stress-low">{t('employee.wellbeingSurvey.low')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="stress-moderate" />
                  <Label htmlFor="stress-moderate">{t('employee.wellbeingSurvey.moderate')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="stress-high" />
                  <Label htmlFor="stress-high">{t('employee.wellbeingSurvey.high')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very-high" id="stress-very-high" />
                  <Label htmlFor="stress-very-high">{t('employee.wellbeingSurvey.veryHigh')}</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('employee.wellbeingSurvey.supportNeeded')}</h3>
              <div className="space-y-3">
                {[
                  "Management Support",
                  "Workload Adjustment",
                  "Flexible Schedule",
                  "Mental Health Resources",
                  "Career Development",
                  "Team Building",
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox id={option} checked={form.supportNeeded?.includes(option)} onCheckedChange={checked => handleCheckboxChange("supportNeeded", option, checked === true)} />
                    <Label htmlFor={option}>{option}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('employee.wellbeingSurvey.additionalComments')}</h3>
              <Textarea
                placeholder="Share your thoughts..."
                className="min-h-32"
                value={form.comments || ""}
                onChange={e => handleTextareaChange("comments", e.target.value)}
              />
            </div>
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium">{t('employee.wellbeingSurvey.anonymousSubmission')}</h4>
                  <p className="text-sm text-muted-foreground">{t('employee.wellbeingSurvey.confidential')}</p>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="notify-hr" checked={notifyHR} onCheckedChange={checked => setNotifyHR(checked === true)} />
                    <Label htmlFor="notify-hr" className="text-sm">{t('employee.wellbeingSurvey.notifyHR')}</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <EmployeePortalLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{t('employee.wellbeingSurvey.wellbeingSurvey')}</h1>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('employee.wellbeingSurvey.monthlyCheck')}</CardTitle>
                  <Badge variant="outline">{t('employee.wellbeingSurvey.anonymous')}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{t('employee.wellbeingSurvey.step')} {currentStep} {t('employee.wellbeingSurvey.of')} {totalSteps}</span>
                    <span>{t('employee.wellbeingSurvey.complete')} {Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {renderStep()}
                <Separator />
                {submitError && <div className="text-red-600 text-sm text-center">{t('employee.wellbeingSurvey.error')}</div>}
                {submitSuccess && <div className="text-green-600 text-sm text-center">{t('employee.wellbeingSurvey.surveySubmitted')}</div>}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1 || submitting}>{t('employee.wellbeingSurvey.previous')}</Button>
                  {currentStep === totalSteps ? (
                    <Button onClick={handleSubmit} disabled={submitting}>
                      <Send className="h-4 w-4 mr-2" />
                      {submitting ? t('employee.wellbeingSurvey.submitting') : t('employee.wellbeingSurvey.submit')}
                    </Button>
                  ) : (
                    <Button onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))} disabled={submitting}>{t('employee.wellbeingSurvey.next')}</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* HR Results Section (if showResults) */}
          {showResults && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="h-5 w-5 mr-2" />
                    {t('employee.wellbeingSurvey.surveyResults')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {surveyResults.length === 0 ? (
                      <div className="text-center text-muted-foreground">{t('employee.wellbeingSurvey.noResults')}</div>
                    ) : (
                      surveyResults.map((survey: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{survey.submittedBy?.Names || "Anonymous"}</p>
                            <p className="text-sm text-muted-foreground">{survey.surveyData?.overall ? `${t('employee.wellbeingSurvey.score')}: ${survey.surveyData.overall}/10` : "No score"}</p>
                          </div>
                          <Badge variant="secondary">{survey.surveyData?.workLife || "-"}</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </EmployeePortalLayout>
  );
}
