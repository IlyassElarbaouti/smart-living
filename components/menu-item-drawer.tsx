"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useCart } from "@/state";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  venueId: string;
  venue: {
    id: string;
    name: string;
    type: string;
    description?: string;
    location: string;
  };
}

interface MenuItemDrawerProps {
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MenuItemDrawer({ item, open, onOpenChange }: MenuItemDrawerProps) {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addItem = useCart((state) => state.addItem);

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const handleAddToCart = () => {
    if (!item) return;
    
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    
    addItem({
      id: `${item.id}-${Date.now()}`,
      menuItemId: item.id,
      name: item.name,
      price,
      image: item.image,
      venueId: item.venue.id,
      venueName: item.venue.name,
      quantity,
    });
    
    toast.success('Added to cart!', {
      description: `${quantity}x ${item.name} added to your cart.`,
    });
    
    onOpenChange(false);
    setQuantity(1);
  };

  const handleOrder = async () => {
    if (!item) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          venueId: item.venue.id,
          items: [
            {
              menuItemId: item.id,
              quantity,
            },
          ],
          deliveryAddress: null, // Can be extended to ask for room number
          specialInstructions: null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to place order');
      }

      const order = await response.json();
      
      toast.success('Order Placed!', {
        description: `Your order #${order.orderNumber} has been placed successfully.`,
      });
      
      onOpenChange(false);
      setQuantity(1);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order', {
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!item) return null;

  const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
  const totalPrice = price * quantity;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh] max-w-2xl mx-auto">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Image Section with Better Layout */}
          {item.image && (
            <div className="relative w-full h-72 flex-shrink-0 bg-muted">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover rounded-t-lg"
                priority
                sizes="(max-width: 768px) 100vw, 672px"
              />
              <DrawerClose className="absolute right-4 top-4 rounded-full bg-background/80 backdrop-blur-sm p-2 opacity-90 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring transition-all z-10 shadow-lg">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </DrawerClose>
            </div>
          )}

          {/* Content Section - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <DrawerHeader className="px-0 pt-0">
              <DrawerTitle className="text-3xl font-bold">
                {item.name}
              </DrawerTitle>
              <DrawerDescription className="text-base mt-3 leading-relaxed">
                {item.description || "No description available"}
              </DrawerDescription>
            </DrawerHeader>

            {/* Price */}
            <div className="mt-6">
              <p className="text-3xl font-bold text-primary">
                ${price.toFixed(2)}
              </p>
            </div>

            {/* Venue Info */}
            <Card className="mt-6 p-5 bg-gradient-to-br from-gray-50/80 to-gray-100/50 dark:from-gray-900/80 dark:to-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                From
              </h3>
              <p className="text-lg font-semibold">{item.venue.name}</p>
              <p className="text-sm text-muted-foreground mt-1.5">
                {item.venue.location}
              </p>
            </Card>

            {/* Quantity Selector */}
            <div className="mt-8 pb-4">
              <h3 className="text-base font-semibold mb-4">Quantity</h3>
              <div className="flex items-center justify-center gap-6 bg-muted/50 rounded-xl p-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="h-12 w-12 rounded-full border-2 shadow-sm"
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <span className="text-3xl font-bold w-16 text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  className="h-12 w-12 rounded-full border-2 shadow-sm"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Footer - Fixed at bottom */}
          <DrawerFooter className="border-t bg-background/95 backdrop-blur-sm px-6 py-5 flex-shrink-0 shadow-lg">
            <div className="flex gap-3">
              <Button 
                onClick={handleAddToCart}
                variant="outline"
                className="flex-1 h-14 text-lg font-semibold shadow-md hover:shadow-lg transition-shadow"
                size="lg"
              >
                Add to Cart
              </Button>
              <Button 
                onClick={handleOrder}
                disabled={isSubmitting}
                className="flex-1 h-14 text-lg font-semibold shadow-md hover:shadow-lg transition-shadow"
                size="lg"
              >
                {isSubmitting ? 'Ordering...' : `Order Now · $${totalPrice.toFixed(2)}`}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
