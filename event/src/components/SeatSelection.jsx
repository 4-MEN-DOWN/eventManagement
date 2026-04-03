import { useState, useEffect } from "react";
import {
  X,
  Users,
  IndianRupee,
  Check,
  AlertCircle,
  Ticket,
} from "lucide-react";
import { toast } from "react-toastify";

export const SeatSelectionModal = ({
  event,
  isOpen,
  onClose,
  onSeatsSelected,
}) => {
  const [availableSeats, setAvailableSeats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatTypes, setSeatTypes] = useState([]);

  useEffect(() => {
    if (isOpen && event) {
      fetchAvailableSeats();
    }
  }, [isOpen, event]);

  const fetchAvailableSeats = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/v1/event/${event._id}/seats`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch available seats");
      }

      const data = await response.json();
      setAvailableSeats(data.availableSeats);
      setSeatTypes(data.seatTypes);
    } catch (error) {
      console.error("Error fetching seats:", error);
      toast.error("Failed to load available seats");
    } finally {
      setLoading(false);
    }
  };

  const handleSeatSelect = (seatNumber, seatType) => {
    setSelectedSeats((prev) => {
      const isAlreadySelected = prev.includes(seatNumber);
      if (isAlreadySelected) {
        return prev.filter((seat) => seat !== seatNumber);
      } else {
        return [...prev, seatNumber];
      }
    });
  };

  const calculateTotalPrice = () => {
    if (!availableSeats) return 0;

    return selectedSeats.reduce((total, seatNumber) => {
      const seatType = Object.keys(availableSeats).find((type) =>
        availableSeats[type].seats.some(
          (seat) => seat.seatNumber === seatNumber
        )
      );
      return total + (availableSeats[seatType]?.price || 0);
    }, 0);
  };

  const handleProceedToPayment = () => {
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat");
      return;
    }

    onSeatsSelected(selectedSeats, calculateTotalPrice());
    onClose();
  };

  const getSeatTypeColor = (seatType) => {
    switch (seatType) {
      case "front":
        return "bg-red-500 border-red-600";
      case "mid":
        return "bg-blue-500 border-blue-600";
      case "back":
        return "bg-green-500 border-green-600";
      default:
        return "bg-gray-500 border-gray-600";
    }
  };

  const getSeatTypeName = (seatType) => {
    const type = seatTypes.find((st) => st.name === seatType);
    return type?.displayName || seatType;
  };

  const getSeatTypeDescription = (seatType) => {
    const type = seatTypes.find((st) => st.name === seatType);
    return type?.description || "";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Select Your Seats</h2>
              <p className="text-white/90 text-sm mt-1">
                Choose your preferred seats for {event.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        <div
          className="p-6 overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 120px)" }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-600">Loading available seats...</p>
              </div>
            </div>
          ) : availableSeats ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Seat Map */}
              <div className="lg:col-span-2">
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-purple-600" />
                    Seat Map
                  </h3>

                  {/* Stage */}
                  <div className="text-center mb-8">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg shadow-lg">
                      <h4 className="font-semibold">STAGE</h4>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      All seats face the stage
                    </div>
                  </div>

                  {/* Seat Types Legend */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {Object.entries(availableSeats).map(([seatType, data]) => (
                      <div
                        key={seatType}
                        className="text-center p-3 rounded-lg bg-white border border-slate-200"
                      >
                        <div
                          className={`w-6 h-6 mx-auto mb-2 rounded border-2 ${getSeatTypeColor(
                            seatType
                          )}`}
                        ></div>
                        <div className="text-sm font-semibold text-slate-800">
                          {getSeatTypeName(seatType)}
                        </div>
                        <div className="text-xs text-slate-600">
                          {data.seats.length} available
                        </div>
                        <div className="text-sm font-bold text-slate-800 mt-1">
                          <IndianRupee size={12} className="inline" />
                          {data.price}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Seats Grid */}
                  <div className="space-y-6">
                    {Object.entries(availableSeats).map(([seatType, data]) => (
                      <div key={seatType}>
                        <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded ${getSeatTypeColor(
                              seatType
                            )}`}
                          ></div>
                          {getSeatTypeName(seatType)}
                          <span className="text-sm text-slate-500 font-normal">
                            - {getSeatTypeDescription(seatType)}
                          </span>
                        </h4>
                        <div className="grid grid-cols-8 gap-2">
                          {data.seats.map((seat) => (
                            <button
                              key={seat.seatNumber}
                              onClick={() =>
                                handleSeatSelect(seat.seatNumber, seatType)
                              }
                              disabled={!seat.isAvailable}
                              className={`
                                relative p-2 rounded-lg text-xs font-medium transition-all duration-200
                                ${
                                  selectedSeats.includes(seat.seatNumber)
                                    ? "bg-purple-600 text-white border-2 border-purple-700 transform scale-105"
                                    : seat.isAvailable
                                    ? "bg-white text-slate-800 border-2 border-slate-300 hover:border-purple-400 hover:bg-purple-50"
                                    : "bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed"
                                }
                                ${getSeatTypeColor(seatType).split(" ")[0]}
                              `}
                            >
                              {seat.seatNumber}
                              {selectedSeats.includes(seat.seatNumber) && (
                                <Check className="absolute -top-1 -right-1 h-3 w-3 text-white bg-green-500 rounded-full p-0.5" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selection Summary */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Your Selection
                  </h3>

                  {selectedSeats.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                      <p className="font-medium">No seats selected</p>
                      <p className="text-sm mt-1">
                        Click on available seats to select them
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        {selectedSeats.map((seatNumber) => {
                          const seatType = Object.keys(availableSeats).find(
                            (type) =>
                              availableSeats[type].seats.some(
                                (seat) => seat.seatNumber === seatNumber
                              )
                          );
                          const price = availableSeats[seatType]?.price || 0;

                          return (
                            <div
                              key={seatNumber}
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-4 h-4 rounded ${getSeatTypeColor(
                                    seatType
                                  )}`}
                                ></div>
                                <span className="font-medium text-slate-800">
                                  {seatNumber}
                                </span>
                                <span className="text-sm text-slate-600 capitalize">
                                  ({seatType})
                                </span>
                              </div>
                              <div className="flex items-center text-slate-800 font-semibold">
                                <IndianRupee size={14} className="opacity-70" />
                                {price}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="border-t border-slate-200 pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-600">
                            Number of Seats:
                          </span>
                          <span className="font-semibold text-slate-800">
                            {selectedSeats.length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-lg font-bold text-slate-800">
                          <span>Total Amount:</span>
                          <span className="flex items-center">
                            <IndianRupee size={16} className="opacity-80" />
                            {calculateTotalPrice()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleProceedToPayment}
                    disabled={selectedSeats.length === 0}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Proceed to Payment ({selectedSeats.length} seats)
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full py-3 px-4 bg-white text-slate-700 font-medium rounded-lg border border-slate-300 hover:bg-slate-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>

                {/* Help Text */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Selection Guide</p>
                      <ul className="mt-1 space-y-1">
                        <li>• Click on available seats to select them</li>
                        <li>• Click again to deselect</li>
                        <li>• Gray seats are already booked</li>
                        <li>
                          • Your selected seats will be reserved during payment
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-600">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 text-slate-400" />
              <p className="font-medium">Unable to load seat information</p>
              <p className="text-sm mt-1">Please try again later</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
