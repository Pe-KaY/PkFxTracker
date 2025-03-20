"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Edit,
  Trash,
  X,
  Maximize,
} from "lucide-react"
import { useAccounts } from "@/components/account-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { TradeEditForm } from "@/components/trade-edit-form"

interface TradeDetailsDialogProps {
  tradeId: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function TradeDetailsDialog({
  tradeId,
  isOpen,
  onOpenChange,
}: TradeDetailsDialogProps) {
  const { getTradeById, deleteTrade } = useAccounts()
  const { toast } = useToast()
  const [isEditMode, setIsEditMode] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isScreenshotFullscreen, setIsScreenshotFullscreen] = useState(false)

  const trade = getTradeById(tradeId)

  // If trade is not found, close the dialog and return null
  if (!trade) {
    if (isOpen) {
      onOpenChange(false)
    }
    return null
  }

  const handleDelete = () => {
    deleteTrade(tradeId)
    setIsDeleteDialogOpen(false)
    onOpenChange(false)

    toast({
      title: "Trade deleted",
      description: "The trade has been successfully deleted",
    })
  }

  const handleEditComplete = () => {
    setIsEditMode(false)

    toast({
      title: "Trade updated",
      description: "The trade has been successfully updated",
    })
  }

  if (isEditMode) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              Edit Trade
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Update the details of your trade
            </DialogDescription>
          </DialogHeader>

          <TradeEditForm
            trade={trade}
            onCancel={() => setIsEditMode(false)}
            onComplete={handleEditComplete}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-[425px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="border-b border-gray-800 pb-4">
            <DialogTitle className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              Trade Details
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 py-4">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium text-white">
                    {trade.pair}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(trade.date), "MMMM dd, yyyy")}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      trade.direction === "buy"
                        ? "bg-emerald-400/20 text-emerald-400"
                        : "bg-red-400/20 text-red-400"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {trade.direction === "buy" ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )}
                      {trade.direction}
                    </span>
                  </div>

                  <div className="px-3 py-1 rounded-full bg-gray-700 text-xs font-medium text-gray-300">
                    Risk: {trade.risk}%
                  </div>

                  <div className="px-3 py-1 rounded-full bg-gray-700 text-xs font-medium text-gray-300">
                    R:R {trade.riskReward}
                  </div>

                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      trade.result === "win"
                        ? "bg-emerald-400/20 text-emerald-400"
                        : trade.result === "loss"
                        ? "bg-red-400/20 text-red-400"
                        : "bg-yellow-400/20 text-yellow-400"
                    }`}
                  >
                    {trade.result}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg">
                <span className="text-gray-300">Profit/Loss:</span>
                <span
                  className={`text-xl font-bold ${
                    trade.profit > 0
                      ? "text-emerald-400"
                      : trade.profit < 0
                      ? "text-red-400"
                      : "text-yellow-400"
                  }`}
                >
                  {trade.profit >= 0 ? "+" : ""}
                  {typeof trade.profit === "number"
                    ? trade.profit.toFixed(2)
                    : "0.00"}
                </span>
              </div>

              {trade.notes && (
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">
                    Notes
                  </h4>
                  <p className="text-white whitespace-pre-wrap">
                    {trade.notes}
                  </p>
                </div>
              )}

              {trade.screenshot && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-300">
                      Screenshot
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                      onClick={() => setIsScreenshotFullscreen(true)}
                    >
                      <Maximize className="h-4 w-4 mr-1" /> View Fullscreen
                    </Button>
                  </div>
                  <div className="border border-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={trade.screenshot || "/placeholder.svg"}
                      alt="Trade screenshot"
                      className="w-full object-contain max-h-[200px]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditMode(true)}
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 hover:text-cyan-400"
            >
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>

            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash className="mr-2 h-4 w-4" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">
              Delete Trade
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to delete this trade? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Fullscreen Screenshot Dialog */}
      {trade.screenshot && (
        <Dialog
          open={isScreenshotFullscreen}
          onOpenChange={setIsScreenshotFullscreen}
        >
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-[90vw] max-h-[90vh] p-2">
            <div className="relative w-full h-full">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-gray-800 rounded-full"
                onClick={() => setIsScreenshotFullscreen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="flex items-center justify-center w-full h-full">
                <img
                  src={trade.screenshot || "/placeholder.svg"}
                  alt="Trade screenshot"
                  className="max-w-full max-h-[80vh] object-contain"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
