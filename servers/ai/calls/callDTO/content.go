package callDTO

import "encoding/json"

type Content struct {
	Request json.RawMessage `json:"request"`
	Choices []Choice        `json:"choices"`
}

// Choice is one assembled answer of the model, streamed or not.
type Choice struct {
	Index     int        `json:"index"`
	Content   string     `json:"content"`
	Refusal   string     `json:"refusal,omitempty"`
	ToolCalls []ToolCall `json:"toolCalls,omitempty"`
}

type ToolCall struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Arguments string `json:"arguments"`
}
