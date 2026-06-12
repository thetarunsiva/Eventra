const Event = require('../models/Event');
const User = require('../models/User');

const getEventById = async (req, res) => {
      try {
            const event = await Event.findOne({
                  _id: req.params.id,
                  userId: req.user._id
            });
            if (!event) {
                  return res.status(404).json({ 
                        message: "Event not found" 
                  });
            }
            res.json(event);
      }
      catch (error) {
            console.error("Error fetching event by ID:", error);
            res.status(500).json({ message: "Server error while fetching event" });
      }
}; 

const getAllEvents = async (req, res) => {
      try {
            const filter = {};
            // Filter by club
            if (req.query.club) {
                  filter.club = req.query.club;
            }
            // Filter by status
            if (req.query.status) {
                  filter.status = req.query.status;
            }
            // Searching title or description of the events
            if (req.query.search) {
                  filter.$or = [
                        { title: { $regex: req.query.search, $options: 'i' }},
                        { description: { $regex: req.query.search, $options: 'i' }}
                  ];
            }
            const events = await Event.find(filter).sort({ eventDate: 1 });
            res.json(events);
      }
      catch (error) {
            console.error("Error fetching events:", error);
            res.status(500).json({ message: "Server error while fetching events" });
      }
};

const getApprovedEvents = async (req, res) => {
      try {
            const filter = { status: "Approved", userId: req.user._id };
            if (req.query.search) {
                  filter.$or = [
                        {
                              title: {
                                    $regex: req.query.search,
                                    $options: 'i',
                              },
                        },
                        {
                              description: {
                                    $regex: req.query.search,
                                    $options: 'i',
                              },  
                        },
                  ];
            }
            const events = await Event.find(filter).sort({ eventDate: 1 });
            res.json(events);
      }
      catch (error) {
            console.error("Error fetching approved events:", error);
            res.status(500).json({ message: "Server error while fetching approved events" });
      }
};

const getPendingEvents = async (req, res) => {
      try {
            const events = await Event.find({
                  status: "Pending",
                  userId: req.user._id,
            }).sort({ eventDate: 1 });
            res.json(events);
      }
      catch (error) {
            console.error("Error fetching pending events:", error);
            res.status(500).json({ message: "Server error while fetching pending events" });
      }
};

const getAllPendingEvents = async (req, res) => {
      try {
            const events = await Event.find({
                  status: "Pending",
            }).sort({ eventDate: 1 });
            res.json(events);
      }
      catch (error) {
            console.error("Error fetching pending events:", error);
            res.status(500).json({ message: "Server error while fetching pending events" });
      }
};

const getGroupedPendingEvents = async (req, res) => {
      try {
            const groupedEvents = await Event.aggregate([
                  { $match: { status: "Pending" } },
                  { $group: {
                        _id: {
                              title: "$title",
                              eventDate: "$eventDate",
                              club: "$club",
                        },
                        count: { $sum: 1 },
                        eventIds: { $push: "$_id"},
                        userIds: { $push: "$userId" },
                        sampleEvent: { $first: "$$ROOT" },
                  }}
            ]);
            const result = [];
            for (const group of groupedEvents) {
                  const users = await User.find({
                        _id: { $in: group.userIds }
                  }).select("email");
                  result.push({
                        title: group._id,
                        count: group.count,
                        eventIds: group.eventIds,
                        users,
                        sampleEvent: group.sampleEvent,
                  });
            }
            res.json(result);
      }
      catch (error) {
            console.error("Error fetching Grouped pending events:", error);
            res.status(500).json({ message: "Server error while fetching Grouped pending events" });
      }
};

const createEvent = async (req, res) => {
      try {
            const newEvent = new Event(req.body);
            await newEvent.save();
            res.status(201).json({ 
                  message: "Event added successfully", 
                  event: newEvent 
            });
      }
      catch (error) {
            console.error("Error creating event!", error);
            res.status(500).json({ message: "Server error while creating event" });
      }
};

const updateEvent = async (req, res) => {
      try {
            const updatedEvent = await Event.findByIdAndUpdate(
                  req.params.id,
                  req.body,
                  { new: true }
            );
            if (!updatedEvent) {
                  return res.status(404).json({ message: "Event not found" });
            }
            res.json({ 
                  message: "Event updated successfully", 
                  event: updatedEvent 
            });
      }
      catch (error) {
            console.error("Error updating event!", error);
            res.status(500).json({ message: "Server error while updating event" });
      }
};

const approveEvent = async (req, res) => {
      try {
            const approvedEvent = await Event.findByIdAndUpdate(
                  req.params.id,
                  { status: "Approved" },
                  { new: true }
            );
            if (!approvedEvent) {
                  return res.status(404).json({
                        message: "Event not found!"
                  });
            }
            res.json({
                  message: "Event approved successfully!",
                  event: approvedEvent
            });
      }
      catch (error) {
            console.error("Error approving event!", error);
            res.status(500).json({ message: "Server error while approving event!" });
      }
}

const approveManyEvents = async (req, res) => {
      try {
            const { eventIds } = req.body;
            if (!eventIds || eventIds.length === 0) {
                  return res.status(404).json({ message: "No events provided to approve LOL!" });
            }
            await Event.updateMany(
                  { _id: { $in: eventIds } },
                  { status: "Approved" },
            );
            res.json({
                  message: `{eventIds.length} events Approved successfully!`,
            });
      }
      catch (error) {
            console.error("Error approving events!", error);
            res.status(500).json({ message: "Server error while approving events!" });
      }
}

const deleteEvent = async (req, res) => {
      try {
            const deletedEvent = await Event.findByIdAndDelete(req.params.id);
            if (!deletedEvent) {
                  return res.status(404).json({ message: "Event not found" });
            }
            res.json({ 
                  message: "Event deleted successfully", 
                  event: deletedEvent 
            });
      }
      catch (error) {
            console.error("Error deleting event!", error);
            res.status(500).json({ message: "Server error while deleting event" });
      }
};

const deleteManyEvents = async (req, res) => {
      try {
            const { eventIds } = req.body;
            if (!eventIds || eventIds.length === 0) {
                  return res.status(404).json({ message: "No events provided to remove!" });
            }
            await Event.deleteMany({ _id: { $in: eventIds } });
            res.json({ 
                  message: "Events deleted successfully", 
            });
      }
      catch (error) {
            console.error("Error deleting events!", error);
            res.status(500).json({ message: "Server error while deleting events" });
      }
};


module.exports = {
      getEventById,
      getAllEvents,
      getApprovedEvents,
      getPendingEvents,
      getAllPendingEvents,
      getGroupedPendingEvents,
      createEvent,
      updateEvent,
      approveEvent,
      approveManyEvents,
      deleteEvent,
      deleteManyEvents,
};