import React, { useState } from 'react';
import { DemographicsSectionProps } from '@/app/types';

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

function DemographicsSection({
  demographics,
  onUpdateProfile,
  profileData,
  setIsSearchClicked
}: DemographicsSectionProps) {
  const [nameInput, setNameInput] = useState('');
  const [ageInput, setAgeInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [showAddField, setShowAddField] = useState(false);
  const [newDemographicKey, setNewDemographicKey] = useState('');
  const [newDemographicValue, setNewDemographicValue] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string | null>(null);
  const [newKeyInput, setNewKeyInput] = useState('');
  const [newValueInput, setNewValueInput] = useState('');

  const removeDemographic = (key: string) => {
    setIsSearchClicked(false);
    const newDemographics = { ...demographics };
    delete newDemographics[key];
    onUpdateProfile({
      ...profileData,
      demographics: newDemographics,
    });
  };

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Demographics</h3>
      <div className="flex flex-col gap-2">
        {/* Name Field */}
        <div className="flex items-center gap-2">
          <span className="w-20 text-sm">Name:</span>
          {demographics.name ? (
            <span className="bg-grey-100 px-2 py-1 rounded text-sm flex items-center gap-1">
              {capitalize(demographics.name)}
              <button
                onClick={() => removeDemographic('name')}
                className="ml-1 text-grey-500 hover:text-grey-700"
              >
                ×
              </button>
            </span>
          ) : (
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && nameInput.trim()) {
                  onUpdateProfile({
                    ...profileData,
                    demographics: {
                      ...demographics,
                      name: nameInput.trim()
                    },
                  });
                  setNameInput('');
                }
              }}
              placeholder="Enter name..."
              className="px-2 py-1 text-sm bg-transparent outline-none border-grey-300 focus:border-lime-500 w-40"
            />
          )}
        </div>

        {/* Age Field */}
        <div className="flex items-center gap-2">
          <span className="w-20 text-sm">Age:</span>
          {demographics.age ? (
            <span className="bg-grey-100 px-2 py-1 rounded text-sm flex items-center gap-1">
              {demographics.age.toString()}
              <button
                onClick={() => removeDemographic('age')}
                className="ml-1 text-grey-500 hover:text-grey-700"
              >
                ×
              </button>
            </span>
          ) : (
            <input
              type="number"
              value={ageInput}
              onChange={(e) => setAgeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && ageInput.trim()) {
                  onUpdateProfile({
                    ...profileData,
                    demographics: {
                      ...demographics,
                      age: parseInt(ageInput.trim())
                    },
                  });
                  setAgeInput('');
                }
              }}
              placeholder="Enter age..."
              className="px-2 py-1 text-sm bg-transparent outline-none border-grey-300 focus:border-lime-500 w-40"
            />
          )}
        </div>

        {/* Location Field */}
        <div className="flex items-center gap-2">
          <span className="w-20 text-sm">Location:</span>
          {demographics.location ? (
            <span className="bg-grey-100 px-2 py-1 rounded text-sm flex items-center gap-1">
              {capitalize(demographics.location)}
              <button
                onClick={() => removeDemographic('location')}
                className="ml-1 text-grey-500 hover:text-grey-700"
              >
                ×
              </button>
            </span>
          ) : (
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && locationInput.trim()) {
                  onUpdateProfile({
                    ...profileData,
                    demographics: {
                      ...demographics,
                      location: locationInput.trim()
                    },
                  });
                  setLocationInput('');
                }
              }}
              placeholder="Enter location..."
              className="px-2 py-1 text-sm bg-transparent outline-none border-grey-300 focus:border-lime-500 w-40"
            />
          )}
        </div>

        {/* Custom Demographics Fields */}
        {Object.entries(demographics)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, value]) => {
            if (!['name', 'age', 'location'].includes(key)) {
              return (
                <div key={key} className="flex items-center">
                  <div className="flex items-center gap-1">
                    {editingKey === key ? (
                      <input
                        type="text"
                        value={newKeyInput}
                        onChange={(e) => setNewKeyInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newKeyInput.trim()) {
                            const newDemographics = { ...demographics };
                            delete newDemographics[key];
                            newDemographics[newKeyInput.trim()] = value;
                            onUpdateProfile({
                              ...profileData,
                              demographics: newDemographics,
                            });
                            setEditingKey(null);
                            setNewKeyInput('');
                          }
                        }}
                        onBlur={() => {
                          setEditingKey(null);
                          setNewKeyInput('');
                        }}
                        className="px-2 py-1 text-sm bg-transparent outline-none border-grey-300 focus:border-lime-500 w-24"
                        autoFocus
                      />
                    ) : (
                      <>
                        <span
                          className="bg-grey-100 px-2 py-1 rounded text-sm cursor-pointer flex items-center"
                          onClick={() => {
                            setEditingKey(key);
                            setNewKeyInput(key);
                          }}
                        >
                          {capitalize(key)}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeDemographic(key);
                            }}
                            className="ml-1 text-grey-500 hover:text-grey-700"
                          >
                            ×
                          </button>
                        </span>
                        <span>:</span>
                      </>
                    )}
                  </div>

                  <div className="ml-2">
                    {editingValue === key ? (
                      <input
                        type="text"
                        value={newValueInput}
                        onChange={(e) => setNewValueInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newValueInput.trim()) {
                            onUpdateProfile({
                              ...profileData,
                              demographics: {
                                ...demographics,
                                [key]: newValueInput.trim()
                              },
                            });
                            setEditingValue(null);
                            setNewValueInput('');
                          }
                        }}
                        onBlur={() => {
                          setEditingValue(null);
                          setNewValueInput('');
                        }}
                        className="px-2 py-1 text-sm bg-transparent outline-none w-40"
                        autoFocus
                      />
                    ) : (
                      <span
                        className="bg-grey-100 px-2 py-1 rounded text-sm flex items-center gap-1 cursor-pointer"
                        onClick={() => {
                          setEditingValue(key);
                          setNewValueInput(value as string);
                        }}
                      >
                        {typeof value === 'string' ? capitalize(value) : value}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateProfile({
                              ...profileData,
                              demographics: {
                                ...demographics,
                                [key]: ''
                              },
                            });
                          }}
                          className="ml-1 text-grey-500 hover:text-grey-700"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              );
            }
            return null;
          })}

        {/* Add New Demographic Field */}
        {showAddField ? (
          <div className="flex items-center gap-2">
            <div className="w-32">
              <input
                type="text"
                value={newDemographicKey}
                onChange={(e) => setNewDemographicKey(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newDemographicValue.trim()) {
                    e.preventDefault();
                    const trimmedKey = newDemographicKey.trim();
                    const trimmedValue = newDemographicValue.trim();
                    if (trimmedKey && trimmedValue) {
                      onUpdateProfile({
                        ...profileData,
                        demographics: {
                          ...demographics,
                          [trimmedKey]: trimmedValue
                        },
                      });
                      setNewDemographicKey('');
                      setNewDemographicValue('');
                      setShowAddField(false);
                    }
                  }
                }}
                placeholder="Add field"
                className="px-2 py-1 text-sm bg-transparent outline-none border-grey-300 focus:border-lime-500 w-24"
              />
              <span className="mx-1">:</span>
            </div>

            <input
              type="text"
              value={newDemographicValue}
              onChange={(e) => setNewDemographicValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newDemographicKey.trim()) {
                  e.preventDefault();
                  const trimmedKey = newDemographicKey.trim();
                  const trimmedValue = newDemographicValue.trim();
                  if (trimmedKey && trimmedValue) {
                    onUpdateProfile({
                      ...profileData,
                      demographics: {
                        ...demographics,
                        [trimmedKey]: trimmedValue
                      },
                    });
                    setNewDemographicKey('');
                    setNewDemographicValue('');
                    setShowAddField(false);
                  }
                }
              }}
              placeholder="Add value"
              className="px-2 py-1 text-sm bg-transparent outline-none border-grey-300 focus:border-lime-500 w-40 rounded-none"
            />
          </div>
        ) : (
          <div className="flex justify-start">
            <button
              onClick={() => setShowAddField(true)}
              className="text-sm text-grey-500 hover:text-grey-700"
            >
              + Add more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DemographicsSection;
