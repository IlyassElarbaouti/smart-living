"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ShoppingCart, Trash2, Minus, Plus, X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useCart } from "@/state";

export function Cart() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, updateQuantity, clearCart, getTotalItems, getTotalPrice, getItemsByVenue } = useCart();

  // Prevent hydration mismatch by only rendering cart count after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const itemsByVenue = getItemsByVenue();

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Cart is empty', {
        description: 'Please add items to your cart before checking out.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Group items by venue and create separate orders
      const orderPromises = Array.from(itemsByVenue.entries()).map(async ([venueId, venueItems]) => {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            venueId,
            items: venueItems.map(item => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              notes: item.notes,
            })),
            deliveryAddress: null,
            specialInstructions: null,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to place order');
        }

        return response.json();
      });

      const orders = await Promise.all(orderPromises);

      toast.success('Orders Placed!', {
        description: `${orders.length} order(s) placed successfully.`,
      });

      clearCart();
      setOpen(false);
    } catch (error) {
      console.error('Error placing orders:', error);
      toast.error('Failed to place orders', {
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="relative h-12 w-12 rounded-full shadow-lg"
        >
          <ShoppingCart className="h-6 w-6" />
          {mounted && totalItems > 0 && (
            <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[90vh] max-w-2xl mx-auto">
        <div className="flex flex-col h-full overflow-hidden">
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle className="text-2xl font-bold">Your Cart</DrawerTitle>
                <DrawerDescription>
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
                </DrawerDescription>
              </div>
              <DrawerClose className="rounded-full bg-muted p-2 hover:bg-muted/80 transition-colors">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </DrawerClose>
            </div>
          </DrawerHeader>

          {/* Cart Items - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="rounded-full bg-muted p-8 mb-4">
                  <ShoppingCart className="h-16 w-16 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-6">
                  Add items from the menu to get started
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Array.from(itemsByVenue.entries()).map(([venueId, venueItems]) => (
                  <div key={venueId}>
                    <h3 className="text-lg font-semibold mb-3">
                      {venueItems[0].venueName}
                    </h3>
                    <div className="space-y-3">
                      {venueItems.map((item) => (
                        <Card key={item.id} className="p-4">
                          <div className="flex gap-4">
                            {item.image && (
                              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{item.name}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                ${item.price.toFixed(2)} each
                              </p>
                              <div className="flex items-center gap-2 mt-3">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm font-semibold w-8 text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex flex-col items-end justify-between">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeItem(item.menuItemId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <p className="font-bold">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - Fixed at bottom */}
          {items.length > 0 && (
            <DrawerFooter className="border-t bg-background/95 backdrop-blur-sm px-6 py-5 flex-shrink-0 shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear your cart?')) {
                        clearCart();
                        toast.success('Cart cleared');
                      }
                    }}
                    className="flex-1 h-12"
                  >
                    Clear Cart
                  </Button>
                  <Button
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                    className="flex-[2] h-12 text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
                    size="lg"
                  >
                    {isSubmitting ? 'Placing Orders...' : 'Checkout'}
                  </Button>
                </div>
              </div>
            </DrawerFooter>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
