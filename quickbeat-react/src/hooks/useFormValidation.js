import { useState } from 'react';


const useFormValidation = () => {
  const [errors, setErrors] = useState({});

  const rules = {
    genre: {
      required: true,
      message: 'Please select a genre'
    },
    playlist: {
      required: true,
      message: 'Please select a keyword'
    }
  };

  const validateGenre = (value) => {
    if (!value || value === "0" || value === "") {
      return rules.genre.message;
    }
    return null;
  };

  const validatePlaylist = (value) => {
    if (!value || value === "0" || value === "") {
      return rules.playlist.message;
    }
    return null;
  };

  const validateForm = (genre, playlist) => {
    const newErrors = {};

    const genreError = validateGenre(genre);
    const playlistError = validatePlaylist(playlist);

    if (genreError) newErrors.genre = genreError;
    if (playlistError) newErrors.playlist = playlistError;

    setErrors(newErrors);

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };

  const validateField = (field, value) => {
    let error = null;
    
    switch (field) {
      case 'genre':
        error = validateGenre(value);
        break;
      case 'playlist':
        error = validatePlaylist(value);
        break;
      default:
        return null;
    }

    setErrors(prev => ({
      ...prev,
      [field]: error
    }));

    return error;
  };

  const clearErrors = () => {
    setErrors({});
  };

  const clearFieldError = (field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  return {
    errors,
    validateForm,
    validateField,
    clearErrors,
    clearFieldError
  };
};

export default useFormValidation;

