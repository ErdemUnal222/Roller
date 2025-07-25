// /src/features/events/EventCard.jsx

export default function EventCard({ event }) {
  return (
    <div className="border rounded-lg p-4 shadow-md">
      <h3 className="text-xl font-bold">{event.title}</h3>
      <p>{event.date}</p>
      <p>{event.location}</p>
    </div>
  );
}
