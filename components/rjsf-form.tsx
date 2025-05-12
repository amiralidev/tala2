"use client"

import Form from '@rjsf/shadcn';
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { TypographyH2 } from './ui/typography';

const ObjectFieldTemplate = ({ title, properties }: any) => {
    return (
      <div className="mt-4">
          {title}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" >
          {properties.map((prop: any) => (
            <div key={prop.name} className="flex flex-col">
              {prop.content}
            </div>
          ))}
        </div>
      </div>
    );
  };


export function RJSForm ({schema, ...props}) {
    return (
    <Form 
        schema={schema} 
        validator={validator}
        uiSchema={{

        }}
        templates={{ ObjectFieldTemplate}}
        {...props}
    ></Form> )
}