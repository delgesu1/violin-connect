import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AccountFormField {
  id: string;
  label: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  type?: string;
  helpText?: string;
}

export interface AccountFormProps {
  title?: string;
  description?: string;
  fields: AccountFormField[];
  onSubmit?: (formData: Record<string, string>) => void;
  submitButtonText?: string;
  className?: string;
  loading?: boolean;
}

const AccountForm = ({
  title = 'Profile Details',
  description,
  fields,
  onSubmit,
  submitButtonText = 'Update Profile',
  className,
  loading = false
}: AccountFormProps) => {
  const [formValues, setFormValues] = useState<Record<string, string>>(
    fields.reduce((acc, field) => ({
      ...acc,
      [field.id]: field.defaultValue || ''
    }), {})
  );

  const handleChange = (id: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formValues);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            {fields.map((field) => {
              // For email/name pairs, create a grid
              const isFirstInPair = fields.findIndex(f => f.id === field.id) % 2 === 0;
              const hasNextField = fields[fields.findIndex(f => f.id === field.id) + 1];
              const shouldPair = isFirstInPair && hasNextField && 
                (field.id.includes('first') || field.id.includes('last') || 
                field.id.includes('name') || field.id.includes('email') || 
                field.id.includes('phone'));
              
              return (
                <div 
                  key={field.id} 
                  className={cn(
                    shouldPair ? "sm:col-span-1" : "col-span-2",
                    shouldPair && isFirstInPair ? "grid sm:grid-cols-2 gap-4" : ""
                  )}
                >
                  {shouldPair && isFirstInPair ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor={field.id}>{field.label}</Label>
                        <Input
                          id={field.id}
                          type={field.type || 'text'}
                          value={formValues[field.id]}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                          disabled={field.disabled || loading}
                          required={field.required}
                        />
                        {field.helpText && (
                          <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                        )}
                      </div>
                      {hasNextField && (
                        <div className="space-y-2">
                          <Label htmlFor={fields[fields.findIndex(f => f.id === field.id) + 1].id}>
                            {fields[fields.findIndex(f => f.id === field.id) + 1].label}
                          </Label>
                          <Input
                            id={fields[fields.findIndex(f => f.id === field.id) + 1].id}
                            type={fields[fields.findIndex(f => f.id === field.id) + 1].type || 'text'}
                            value={formValues[fields[fields.findIndex(f => f.id === field.id) + 1].id]}
                            onChange={(e) => handleChange(fields[fields.findIndex(f => f.id === field.id) + 1].id, e.target.value)}
                            disabled={fields[fields.findIndex(f => f.id === field.id) + 1].disabled || loading}
                            required={fields[fields.findIndex(f => f.id === field.id) + 1].required}
                          />
                          {fields[fields.findIndex(f => f.id === field.id) + 1].helpText && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {fields[fields.findIndex(f => f.id === field.id) + 1].helpText}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  ) : !shouldPair || !isFirstInPair ? (
                    <div className="space-y-2">
                      <Label htmlFor={field.id}>{field.label}</Label>
                      <Input
                        id={field.id}
                        type={field.type || 'text'}
                        value={formValues[field.id]}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        disabled={field.disabled || loading}
                        required={field.required}
                      />
                      {field.helpText && (
                        <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          
          <Button 
            type="submit" 
            className="w-full sm:w-auto mt-2" 
            disabled={loading}
          >
            {loading ? 'Updating...' : submitButtonText}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AccountForm; 