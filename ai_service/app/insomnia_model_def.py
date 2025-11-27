
import torch
import torch.nn as nn


class InsomniaNet(nn.Module):
    def __init__(self, n_features: int, cnn_channels: int = 32,
                 lstm_hidden: int = 64, lstm_layers: int = 1,
                 dropout: float = 0.2):
        super().__init__()

        self.conv1 = nn.Conv1d(
            in_channels=n_features,
            out_channels=cnn_channels,
            kernel_size=3,
            padding=1,
        )
        self.relu = nn.ReLU()

        self.lstm = nn.LSTM(
            input_size=cnn_channels,
            hidden_size=lstm_hidden,
            num_layers=lstm_layers,
            batch_first=True,
        )

        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(lstm_hidden, 1)

    def forward(self, x):
        # x: (batch, seq_len, n_features)
        x = x.permute(0, 2, 1)      # (batch, n_features, seq_len)
        x = self.conv1(x)
        x = self.relu(x)
        x = x.permute(0, 2, 1)      # (batch, seq_len, channels)
        _, (h_n, _) = self.lstm(x)
        h_last = h_n[-1]            # (batch, hidden)
        h_last = self.dropout(h_last)
        out = self.fc(h_last)       # (batch, 1)
        return out
