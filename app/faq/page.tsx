export default function FAQPage() {
  const faqs = [
    {
      question: "How do I rent a workspace?",
      answer:
        "Browse available properties, choose a workspace, and complete your booking securely.",
    },
    {
      question: "Can I contact the owner?",
      answer:
        "Yes. Every workspace includes an AI Assistant that helps you before sending your request to the owner.",
    },
    {
      question: "Are payments secure?",
      answer:
        "Yes. Payments are processed securely using Stripe.",
    },
    {
      question: "Can owners manage multiple properties?",
      answer:
        "Absolutely. Owners can add and manage unlimited properties and workspaces.",
    },
  ];

  return (
    <main className="max-w-5xl mx-auto px-6 py-20">

      <h1 className="text-4xl font-bold text-center mb-12">
        Frequently Asked Questions
      </h1>

      <div className="space-y-6">

        {faqs.map((faq) => (
          <div
            key={faq.question}
            className="rounded-2xl border p-6 shadow-sm"
          >
            <h2 className="font-semibold text-lg mb-3">
              {faq.question}
            </h2>

            <p className="text-gray-600">
              {faq.answer}
            </p>
          </div>
        ))}

      </div>

    </main>
  );
}