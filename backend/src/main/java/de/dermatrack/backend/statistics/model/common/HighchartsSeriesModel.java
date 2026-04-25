package de.dermatrack.backend.statistics.model.common;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HighchartsSeriesModel {

    private String name;
    private List<Double> data;
}
