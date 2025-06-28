'use client'
import {
    PopoverForm,
    PopoverFormButton,
    PopoverFormCutOutLeftIcon,
    PopoverFormCutOutRightIcon,
    PopoverFormSeparator,
    PopoverFormSuccess,
  } from "@/components/ui/popover-form"
  import { useState, useEffect } from "react"
  import { useForm, ValidationError } from '@formspree/react';

  
  export default function NewfeaturePopover() {
    const [open, setOpen] = useState(false)
    const [state, handleSubmit] = useForm("manjavgy");
    
    if (state.succeeded) {
      return (
        <div className="flex items-center justify-center">
          <PopoverForm
            title="New Feature?"
            open={open}
            setOpen={setOpen}
            width="364px"
            height="192px"
            showCloseButton={false}
            showSuccess={true}
            successChild={
              <PopoverFormSuccess
                title="Request Received"
                description="Thank you for supporting our project!"
              />
            }
          />
        </div>
      );
    }
  
    return (
      <div className="flex items-center justify-center">
        <PopoverForm
          title="New Feature?"
          open={open}
          setOpen={setOpen}
          width="364px"
          height="192px"
          showCloseButton={true}
          showSuccess={false}
          openChild={
            <form
              onSubmit={handleSubmit}
            >
              <div className="relative">
                <textarea
                  id="message"
                  name="message"
                  autoFocus
                  placeholder="New Feature Description..."
                  className="h-32 w-full resize-none rounded-t-lg p-3 text-sm outline-none"
                  required
                />
                <ValidationError 
                  prefix="Message" 
                  field="message"
                  errors={state.errors}
                />
              </div>
              <div className="relative flex h-12 items-center px-[10px]">
                <PopoverFormSeparator />
                <div className="absolute left-0 top-0 -translate-x-[1.5px] -translate-y-1/2">
                  <PopoverFormCutOutLeftIcon />
                </div>
                <div className="absolute right-0 top-0 translate-x-[1.5px] -translate-y-1/2 rotate-180">
                  <PopoverFormCutOutRightIcon />
                </div>
                <button 
                  type="submit" 
                  disabled={state.submitting}
                  className="flex items-center justify-center rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-black/80 disabled:pointer-events-none disabled:opacity-50"
                >
                  {state.submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          }
        />
      </div>
    )
  }