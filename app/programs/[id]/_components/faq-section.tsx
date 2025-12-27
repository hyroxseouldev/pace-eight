import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FAQSection() {
  const faqs = [
    {
      question: "초보자도 할 수 있나요?",
      answer:
        "네, 가능합니다. 프로그램은 난이도별로 구성되어 있어 초보자부터 중급자까지 모두 참여할 수 있습니다. 각 운동의 강도는 개인의 수준에 맞게 조절할 수 있습니다.",
    },
    {
      question: "환불이 가능한가요?",
      answer:
        "구독 후 7일 이내에는 전액 환불이 가능합니다. 그 이후에는 다음 결제일 전까지 언제든지 구독을 취소할 수 있으며, 현재 결제 기간까지는 프로그램을 이용할 수 있습니다.",
    },
    {
      question: "운동 장비가 필요한가요?",
      answer:
        "프로그램에 따라 다릅니다. 대부분의 프로그램은 기본적인 장비(요가매트, 덤벨 등)만 있으면 충분하며, 각 프로그램의 상세 정보에서 필요한 장비를 확인할 수 있습니다.",
    },
    {
      question: "하루에 얼마나 시간을 투자해야 하나요?",
      answer:
        "프로그램마다 권장 운동 시간이 다릅니다. 프로그램 정보에 표시된 '훈련 시간'을 참고하세요. 대부분 하루 30분~2시간 정도입니다.",
    },
    {
      question: "프로그램을 중간에 변경할 수 있나요?",
      answer:
        "네, 가능합니다. 현재 구독 중인 프로그램을 취소하고 다른 프로그램을 구독할 수 있습니다. 다만, 환불 정책에 따라 처리됩니다.",
    },
    {
      question: "코치와 직접 소통할 수 있나요?",
      answer:
        "일부 프로그램에서는 코치와의 1:1 피드백이 포함되어 있습니다. 프로그램 상세 정보에서 피드백 포함 여부를 확인하세요.",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>자주 묻는 질문</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

