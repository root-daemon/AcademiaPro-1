package helpers

import (
	"strings"
	"testing"
	"time"
)

func TestPlannerURLsPreferCurrentOddTerm(t *testing.T) {
	// July 2026 should prefer 2026_27_ODD first.
	urls := plannerURLs(time.Date(2026, time.July, 26, 0, 0, 0, 0, time.UTC))
	if len(urls) == 0 {
		t.Fatal("expected planner URLs")
	}
	if !strings.Contains(urls[0], "Academic_Planner_2026_27_ODD") {
		t.Fatalf("first planner URL = %q, want Academic_Planner_2026_27_ODD", urls[0])
	}
}

func TestPlannerURLsPreferCurrentEvenTerm(t *testing.T) {
	urls := plannerURLs(time.Date(2026, time.February, 10, 0, 0, 0, 0, time.UTC))
	if len(urls) == 0 {
		t.Fatal("expected planner URLs")
	}
	if !strings.Contains(urls[0], "Academic_Planner_2025_26_EVEN") {
		t.Fatalf("first planner URL = %q, want Academic_Planner_2025_26_EVEN", urls[0])
	}
}
