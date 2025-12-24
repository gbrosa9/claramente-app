import React from "react";

type Params = {
  patientId: string;
  conversationId: string;
};

export default function ConversationPage({
  params,
}: {
  params: Params;
}) {
  return (
    <main className="min-h-screen bg-white p-6">
      <h1 className="text-2xl font-bold">Conversa</h1>
      <p className="mt-2 text-slate-600">
        Patient: <span className="font-mono">{params.patientId}</span>
      </p>
      <p className="text-slate-600">
        Conversation: <span className="font-mono">{params.conversationId}</span>
      </p>
    </main>
  );
}
