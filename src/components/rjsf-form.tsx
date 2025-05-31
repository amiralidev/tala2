"use client";

import Form from "@rjsf/shadcn";
import validator from "@rjsf/validator-ajv8";
import { getSubmitButtonOptions, SubmitButtonProps } from "@rjsf/utils";

const ObjectFieldTemplate = ({ title, properties }: any) => {
  return (
    <div className="mt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {properties.map((prop: any) => (
          <div key={prop.name} className="flex flex-col">
            {prop.content}
          </div>
        ))}
      </div>
    </div>
  );
};

function SubmitButton(props: SubmitButtonProps) {
  const { uiSchema } = props;
  const { norender } = getSubmitButtonOptions(uiSchema);
  if (norender) {
    return null;
  }
  return <button type="button"></button>;
}

export function RJSForm({ schema, ...props }) {
  return (
    <Form
      schema={schema}
      validator={validator}
      uiSchema={{}}
      templates={{ ObjectFieldTemplate, SubmitButton }}
      {...props}
    ></Form>
  );
}
