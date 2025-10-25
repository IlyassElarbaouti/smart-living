"use client";

import { ChevronRight, Phone, Navigation } from "lucide-react";
import { AnimatedTabs } from "./ui/animated-tabs";
import { Card } from "./ui/card";
import Image from "next/image";
import {
  Stories,
  StoriesContent,
  Story,
  StoryAuthor,
  StoryAuthorName,
  StoryImage,
  StoryOverlay,
} from "./stories-carousel";
import { useEffect, useState } from "react";
import { MenuItemDrawer } from "./menu-item-drawer";

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  servicesDescription?: string;
  order: number;
  isActive: boolean;
}

interface Venue {
  id: string;
  name: string;
  type: string;
  description?: string;
  location: string;
  image?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  categoryId?: string;
  category?: ServiceCategory;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  venueId: string;
  venue: Venue;
}

const Menu = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedVenue, setSelectedVenue] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0) {
            setSelectedCategory(data[0].id);
          }
        } else {
          console.error("Categories data is not an array:", data);
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch venues when category changes
  useEffect(() => {
    if (!selectedCategory) return;
    
    const fetchVenues = async () => {
      try {
        const response = await fetch(`/api/venues?categoryId=${selectedCategory}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setVenues(data);
          if (data.length > 0) {
            setSelectedVenue(data[0].id);
          } else {
            setSelectedVenue("");
            setMenuItems([]);
          }
        } else {
          console.error("Venues data is not an array:", data);
          setVenues([]);
          setSelectedVenue("");
          setMenuItems([]);
        }
      } catch (error) {
        console.error("Error fetching venues:", error);
        setVenues([]);
      }
    };
    fetchVenues();
  }, [selectedCategory]);

  // Fetch menu items when venue changes
  useEffect(() => {
    if (!selectedVenue) {
      setMenuItems([]);
      setLoading(false);
      return;
    }
    
    const fetchMenuItems = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/menu-items?venueId=${selectedVenue}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setMenuItems(data);
        } else {
          console.error("Menu items data is not an array:", data);
          setMenuItems([]);
        }
      } catch (error) {
        console.error("Error fetching menu items:", error);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMenuItems();
  }, [selectedVenue]);

  const selectedVenueData = venues.find(v => v.id === selectedVenue);

  const handleCall = () => {
    if (selectedVenueData?.phone) {
      window.location.href = `tel:${selectedVenueData.phone}`;
    }
  };

  const handleDirections = () => {
    if (selectedVenueData?.latitude && selectedVenueData?.longitude) {
      // Open in Google Maps
      const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedVenueData.latitude},${selectedVenueData.longitude}`;
      window.open(url, '_blank');
    } else if (selectedVenueData?.location) {
      // Fallback to search by location name
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedVenueData.name + ' ' + selectedVenueData.location)}`;
      window.open(url, '_blank');
    }
  };

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setDrawerOpen(true);
  };

  return (
    <Card className="z-1 w-full flex-1 p-3 relative gap-0 shadow-sm overflow-y-auto-auto">
      <div className="flex justify-start items-start">
        <AnimatedTabs
          variant="underlined"
          tabs={categories.map((cat) => ({ label: cat.name, value: cat.id }))}
          value={selectedCategory}
          onChange={setSelectedCategory}
        />
      </div>
      <button className="flex cursor-pointer items-center align-middle mx-2 mt-4">
        <h2 className="text-2xl font-medium align-middle">Order</h2>
        <ChevronRight />
      </button>
      <h2 className="mx-2">Available right now</h2>
      <div className="mt-4">
        {venues.length > 0 ? (
          <AnimatedTabs
            variant="default"
            tabs={venues.map((venue) => ({ label: venue.name, value: venue.id }))}
            value={selectedVenue}
            onChange={setSelectedVenue}
          />
        ) : (
          <p className="text-sm text-muted-foreground mx-2">No venues available for this category</p>
        )}
      </div>
      {selectedVenueData && (
        <Card className="mt-4 p-4 cursor-pointer bg-gray-50/50 dark:bg-gray-900/50 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-800">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">
                {selectedVenueData.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {selectedVenueData.location}
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={handleCall}
                  disabled={!selectedVenueData.phone}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Phone className="w-4 h-4" />
                  Call
                </button>
                <button 
                  onClick={handleDirections}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  Directions
                </button>
              </div>
            </div>
            {selectedVenueData.image && (
              <div className="w-24 h-24 rounded-lg overflow-hidden ml-4 flex-shrink-0 shadow-sm">
                <Image
                  src={selectedVenueData.image}
                  alt={selectedVenueData.name}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
          </div>
        </Card>
      )}
      <button className="flex cursor-pointer items-center justify-between w-full mx-2 mt-6 mb-3">
        <h2 className="text-xl font-semibold">
          {categories.find(cat => cat.id === selectedCategory)?.servicesDescription || 'Items'}
        </h2>
        <ChevronRight className="text-muted-foreground" />
      </button>
      {loading ? (
        <div className="mx-2 text-sm text-muted-foreground">Loading menu items...</div>
      ) : menuItems.length > 0 ? (
        <Stories>
          <StoriesContent className="mx-2">
            {menuItems.map((item) => (
              <Story 
                key={item.id} 
                className="aspect-[3/4] w-[200px] cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                <StoryImage
                  src={item.image || "/placeholder-food.jpg"}
                  alt={item.name}
                />
                <StoryOverlay />
                <StoryAuthor>
                  <StoryAuthorName>{item.name}</StoryAuthorName>
                </StoryAuthor>
              </Story>
            ))}
          </StoriesContent>
        </Stories>
      ) : (
        <div className="mx-2 text-sm text-muted-foreground">
          No menu items available for this venue
        </div>
      )}
      <MenuItemDrawer 
        item={selectedItem} 
        open={drawerOpen} 
        onOpenChange={setDrawerOpen}
      />
    </Card>
  );
};

export default Menu;
