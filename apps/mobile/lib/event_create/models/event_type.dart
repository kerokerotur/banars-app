class EventType {
  const EventType({
    required this.id,
    required this.name,
    required this.displayOrder,
  });

  factory EventType.fromJson(Map<String, dynamic> json) {
    return EventType(
      id: json['id'] as String,
      name: json['name'] as String,
      displayOrder: json['display_order'] as int? ?? 0,
    );
  }

  final String id;
  final String name;
  final int displayOrder;
}
