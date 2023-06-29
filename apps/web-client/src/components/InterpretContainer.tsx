import { assign } from "xstate";
import { useMachine } from "@xstate/react";
import React, { useEffect } from "react";
import {
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonLoading,
} from "@ionic/react";
import type { ClientConfig } from "../utils/config";
import { interpret } from "xstate";


import { machine } from './machine'

const LanguageSelector: React.FC<{ language: string; onLanguageChange: (language: string) => void }> = ({ language, onLanguageChange }) => (
  <IonItem>
    <IonLabel>Language</IonLabel>
    <IonSelect value={language} placeholder="Select One" onIonChange={e => onLanguageChange(e.detail.value)}>
      <IonSelectOption value="zh">Chinese</IonSelectOption>
      <IonSelectOption value="kr">Korean</IonSelectOption>
    </IonSelect>
  </IonItem>
);


const InterpretBar: React.FC<{
  onTaskResult: (res: string) => void;
  config: ClientConfig;
}> = ({ onTaskResult, config }) => {
  const [state, send, ] = useMachine(machine, {
    devTools: true,
    guards: {
      isChinese: (context) => context.language === "zh",
    },
    actions: {
      submitChinese: (context) => {
        // Fetch logic goes here, this is a mock example
        fetch(`${config.baseUrl}/chinese`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_input: context.text }),
        })
          .then((response) => response.json())
          .then((data) => send({ type: "TASK_RECEIVED", taskId: data.task_id }))
          .catch((error) => console.error("Error:", error));
      },
      setLoading: assign({ loading: true }),
      clearError: assign({ inputError: "", inputColor: "light" }),
      setTaskId: assign((_, event) => {
        if (event.type !== 'TASK_RECEIVED') return {};
        return {
          taskId: event.taskId,
        }
      }),
      setError: assign({
        inputError: "Please enter valid Chinese",
        inputColor: "danger",
      }),
      resetLoading: assign({ loading: false }),
    },
  });

  useEffect(() => {
    if (state.context.taskId) {
      const eventSource = new EventSource(
        `${config.baseUrl}/task/${state.context.taskId}/stream`
      );

      eventSource.onmessage = (event) => {
        const result = event.data ? event.data : "ari could not be generated :(";
        onTaskResult(result);
        send("NEW_TASK");
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    }
  }, [state.context.taskId, onTaskResult, config.baseUrl, send]);

  const handleSubmit = () => {
    send("SUBMIT");
  };

  return (
    <div>
      {state.context.inputError && <p>{state.context.inputError}</p>}
      <LanguageSelector
        language={state.context.language}
        onLanguageChange={(language) =>
          send({ type: "UPDATE_LANGUAGE", language })
        }
      />
      <IonItem color={state.context.inputColor}>
        <IonInput
          value={state.context.text}
          placeholder="Enter Text"
          onIonChange={(e) => {
            send({ type: "UPDATE_TEXT", text: e.detail.value + "" } as const)
          }
          }
          clearInput
        />
      </IonItem>
      <IonButton onClick={handleSubmit}>Start Task</IonButton>
      <IonLoading
        message={"Loading..."}
        isOpen={state.context.loading}
      />
    </div>
  );
};

export default InterpretBar;
