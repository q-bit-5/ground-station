import pytest

from handlers.entities import satellites as satellite_handlers


class _NoopLogger:
    def debug(self, *_args, **_kwargs):
        return None

    def error(self, *_args, **_kwargs):
        return None


@pytest.mark.asyncio
async def test_target_search_uses_mission_group_hint(monkeypatch):
    captured = {}

    async def _fake_search_satellites(_sio, _data, _logger, _sid):
        return {"success": True, "data": []}

    def _fake_search_spacecraft_index(query, limit):
        captured["query"] = query
        captured["limit"] = limit
        return [
            {
                "command": "Voyager 1",
                "display_name": "Voyager 1",
                "mission_status": "active",
                "status_label": "Active",
            }
        ]

    def _fake_search_celestial_bodies(query, limit):
        captured["body_query"] = query
        captured["body_limit"] = limit
        return []

    monkeypatch.setattr(satellite_handlers, "search_satellites", _fake_search_satellites)
    monkeypatch.setattr(
        satellite_handlers, "search_spacecraft_index", _fake_search_spacecraft_index
    )
    monkeypatch.setattr(
        satellite_handlers, "search_celestial_bodies", _fake_search_celestial_bodies
    )

    result = await satellite_handlers.search_targets(
        sio=None,
        data={"query": "mis", "limit": 7},
        logger=_NoopLogger(),
        sid="sid-1",
    )

    assert result["success"] is True
    assert captured["query"] == ""
    assert captured["limit"] == 7
    mission_rows = [row for row in result["data"] if str(row.get("target_type") or "") == "mission"]
    assert len(mission_rows) == 1
    assert mission_rows[0]["target_identifier"] == "Voyager 1"


@pytest.mark.asyncio
async def test_target_search_uses_moon_group_hint(monkeypatch):
    captured = {}

    async def _fake_search_satellites(_sio, _data, _logger, _sid):
        return {"success": True, "data": []}

    def _fake_search_spacecraft_index(query, limit):
        captured["mission_query"] = query
        captured["mission_limit"] = limit
        return []

    def _fake_search_celestial_bodies(query, limit):
        captured["body_query"] = query
        captured["body_limit"] = limit
        return [
            {
                "body_id": "moon",
                "name": "Moon",
                "body_type": "moon",
                "parent_body_id": "earth",
            },
            {
                "body_id": "europa",
                "name": "Europa",
                "body_type": "moon",
                "parent_body_id": "jupiter",
            },
            {
                "body_id": "mars",
                "name": "Mars",
                "body_type": "planet",
                "parent_body_id": None,
            },
        ]

    monkeypatch.setattr(satellite_handlers, "search_satellites", _fake_search_satellites)
    monkeypatch.setattr(
        satellite_handlers, "search_spacecraft_index", _fake_search_spacecraft_index
    )
    monkeypatch.setattr(
        satellite_handlers, "search_celestial_bodies", _fake_search_celestial_bodies
    )

    result = await satellite_handlers.search_targets(
        sio=None,
        data={"query": "moo", "limit": 10},
        logger=_NoopLogger(),
        sid="sid-2",
    )

    assert result["success"] is True
    assert captured["body_query"] == ""
    assert captured["body_limit"] >= 50

    body_rows = [row for row in result["data"] if row.get("target_type") == "body"]
    body_ids = {row.get("body_id") for row in body_rows}
    assert body_ids == {"moon", "europa"}
