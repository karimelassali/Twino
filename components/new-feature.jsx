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
  
  export default function NewfeaturePopover() {
    const [formState, setFormState] = useState("idle")
    const [open, setOpen] = useState(false)
    const [feedback, setFeedback] = useState("")
  
    function submit() {
      setFormState("loading")
      setTimeout(() => {
        setFormState("success")
      }, 1500)
  
      setTimeout(() => {
        setOpen(false)
        setFormState("idle")
        setFeedback("")
      }, 3300)
    }
  
    useEffect(() => {
      const handleKeyDown = (event) => {
        if (event.key === "Escape") {
          setOpen(false)
        }
  
        if (
          (event.ctrlKey || event.metaKey) &&
          event.key === "Enter" &&
          open &&
          formState === "idle"
        ) {
          submit()
        }
      }
  
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [open, formState])
  
    return (
      <div className="flex items-center justify-center">
        <PopoverForm
          title="New Feature?"
          open={open}
          setOpen={setOpen}
          width="364px"
          height="192px"
          showCloseButton={formState !== "success"}
          showSuccess={formState === "success"}
          openChild={
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!feedback) return
                submit()
              }}
            >
              <div className="relative">
                <textarea
                  autoFocus
                  placeholder="New Feature Description..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="h-32 w-full resize-none rounded-t-lg p-3 text-sm outline-none"
                  required
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
                <PopoverFormButton loading={formState === "loading"} />
              </div>
            </form>
          }
          successChild={
            <PopoverFormSuccess
              title="Request Received"
              description="Thank you for supporting our project!"
            />
          }
        />
      </div>
    )
  }
  