"use client"

import { scrapeAndStoreProduct } from "@/lib/actions";
import { error } from "console";
import { FormEvent, useState } from "react"
import Swal from "sweetalert2";

export const SearchBar = () => {

  const [searchPrompt, setSearchPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const triggerErrorAlert = () => {
    Swal.fire({
      icon: "error",
      title: "Error: Invalid URL",
      text: "Please provide a valid amazon link.",
      customClass: {
        confirmButton: 'custom-swal-button'
      },
      buttonsStyling: false 
    });
  }

  const isValidAmazonLink = (url: string) => {
    try {
      const parsedURL = new URL(url);
      const hostName = parsedURL.hostname;

      if(hostName.includes('amazon.com') || hostName.includes('amazon.') || hostName.endsWith('amazon')) {
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const isValidLink = isValidAmazonLink(searchPrompt);

      if(!isValidLink) return triggerErrorAlert();

      try {
        setIsLoading(true);
        const product = await scrapeAndStoreProduct(searchPrompt);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }

    }

  return (
    <form className="flex flex-wrap gap-4 mt-12" onSubmit={handleSubmit}>
        <input 
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
        className="searchbar-input"
        type="text"
        placeholder="Enter Product Link Here.."
        />
        <button 
        type="submit"
        className="searchbar-btn"
        disabled={searchPrompt === ''}
        >
        {isLoading ? 'Searching...' : 'Search'}
        </button>
    </form>
  )
}

