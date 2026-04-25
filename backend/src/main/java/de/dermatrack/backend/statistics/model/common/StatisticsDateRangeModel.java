package de.dermatrack.backend.statistics.model.common;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsDateRangeModel {

    private LocalDate from;
    private LocalDate to;
}
