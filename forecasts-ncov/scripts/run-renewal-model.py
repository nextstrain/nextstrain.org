#!/usr/bin/env python
# coding: utf-8

import argparse
import pandas as pd
import os
import yaml
import evofr as ef


def parse_with_default(cf, var, dflt):
    if var in cf:
        return cf[var]
    else:
        print(f"Using default value for {var}")
        return dflt


def parse_RLik(cf_m):
    # Don't like defaults being here...
    name = "GARW"
    gp = 0.5
    gdp = 10

    # Check for fields of interest
    if "R_likelihood" in cf_m:
        name = cf_m["R_likelihood"]
    if "gam_prior" in cf_m:
        gp = cf_m["gam_prior"]
    if "gam_delta_prior" in cf_m:
        gdp = cf_m["gam_delta_prior"]

    # Select options
    if name == "GARW":
        return ef.GARW(gam_prior=gp, gam_delta_prior=gdp)
    elif name == "Free":
        return ef.FreeGrowth(gam_prior=gp)
    elif name == "Fixed":
        return ef.FixedGA(gam_prior=gp)


def parse_CLik(cf_m):
    # Don't like defaults being here...
    name = "ZINegBinom"
    pcd = 0.01

    # Check for fields of interest
    if "C_likelihood" in cf_m:
        name = cf_m["C_likelihood"]
    if "prior_case_dispersion" in cf_m:
        pcd = cf_m["prior_case_dispersion"]

    # Select likelhood
    if name == "NegBinom":
        return ef.NegBinomCases(pcd)
    elif name == "ZINegBinom":
        return ef.ZINegBinomCases(pcd)
    elif name == "Poisson":
        return ef.PoisCases()
    elif name == "ZIPoisson":
        return ef.ZIPoisCases()


def parse_SLik(cf_m):
    # Don't like defaults being here...
    name = "DirMultinomial"
    psd = 100.0

    # Check for fields of interest
    if "S_likelihood" in cf_m:
        name = cf_m["S_likelihood"]
    if "prior_seq_dispersion" in cf_m:
        psd = cf_m["prior_seq_dispersion"]

    if name == "DirMultinomial":
        return ef.DirMultinomialSeq(psd)
    elif name == "Multinomial":
        return ef.MultinomialSeq()


def parse_distributions(cf_dist):
    mn = cf_dist["mean"]
    sd = cf_dist["sd"]
    family = cf_dist["family"]
    if family == "LogNormal":
        return ef.discretise_lognorm(mn=mn, std=sd)
    elif family == "Gamma":
        return ef.discretise_gamma(mn=mn, std=sd)


def parse_generation_time(cf_m):
    multiple_variants = "mean" not in cf_m["generation_time"]
    if multiple_variants:
        gen = ef.pad_delays(
            [
                parse_distributions(dist)
                for dist in cf_m["generation_time"].values()
            ]
        )
        v_names = [dist["name"] for dist in cf_m["generation_time"].values()]
    else:
        gen = parse_distributions(cf_m["generation_time"])
        v_names = None
    return gen, v_names


def parse_delays(cf_m):
    delays = ef.pad_delays(
        [parse_distributions(d) for d in cf_m["delays"].values()]
    )
    return delays


def parse_inference_method(method_name, lr, iters, num_warmup, num_samples):
    if method_name == "FullRank":
        method = ef.InferFullRank(lr=lr, iters=iters, num_samples=num_samples)
    elif method_name == "MAP":
        method = ef.InferMAP(lr=lr, iters=iters)
    elif method_name == "NUTS":
        method = ef.InferNUTS(num_warmup=num_warmup, num_samples=num_samples)
    else:  # Default is full rank
        method = ef.InferFullRank(lr=lr, iters=iters, num_samples=num_samples)
    return method


class RenewalConfig:
    def __init__(self, path):
        self.path = path
        self.config = self.read_config(path)

    def read_config(self, path):
        with open(path, "r") as file:
            config = yaml.safe_load(file)
        return config

    def load_data(self, override_case_path=None, override_seq_path=None):
        data_cf = self.config["data"]

        # Load case data
        case_path = override_case_path or data_cf["case_path"]
        if case_path.endswith(".tsv"):
            raw_cases = pd.read_csv(case_path, sep="\t")
        else:
            raw_cases = pd.read_csv(case_path)

        # Load sequence count data
        seq_path = override_seq_path or data_cf["seq_path"]
        if seq_path.endswith(".tsv"):
            raw_seq = pd.read_csv(seq_path, sep="\t")
        else:
            raw_seq = pd.read_csv(seq_path)

        # Load locations
        if "locations" in data_cf:
            locations = data_cf["locations"]
        else:
            # Check if raw_seq has location column
            locations = pd.unique(raw_seq["location"])

        return raw_cases, raw_seq, locations

    def load_model(self):
        model_cf = self.config["model"]

        # Processing hyperparameters
        seed_L = parse_with_default(model_cf, "seed_L", dflt=7)
        forecast_L = parse_with_default(model_cf, "forecast_L", dflt=0)
        k = parse_with_default(model_cf, "k", dflt=10)
        order = parse_with_default(model_cf, "order", dflt=4)

        # Processing generation time and delays
        gen, v_names = parse_generation_time(model_cf)
        delays = parse_delays(model_cf)

        basis_fn = ef.Spline(k=k, order=order)

        # Processing likelihoods
        model = ef.RenewalModel(
            gen,
            delays,
            seed_L,
            forecast_L,
            RLik=parse_RLik(model_cf),  # Default is GARW
            CLik=parse_CLik(model_cf),  # Default is NegBinom
            SLik=parse_SLik(model_cf),
            v_names=v_names,
            basis_fn=basis_fn,
        )  # Default is DirMultinomial
        return model

    def load_optim(self):
        infer_cf = self.config["inference"]
        lr = float(parse_with_default(infer_cf, "lr", dflt=1e-2))
        iters = int(parse_with_default(infer_cf, "iters", dflt=50000))
        num_warmup = int(parse_with_default(infer_cf, "num_warmup", dflt=500))
        num_samples = int(
            parse_with_default(infer_cf, "num_samples", dflt=1500)
        )

        # Build inference method
        method_name = parse_with_default(infer_cf, "method", dflt="FullRank")
        inference_method = parse_inference_method(
            method_name, lr, iters, num_warmup, num_samples
        )
        return inference_method

    def load_settings(self, override_export_path=None):
        settings_cf = self.config["settings"]
        fit = parse_with_default(settings_cf, "fit", dflt=False)
        save = parse_with_default(settings_cf, "save", dflt=False)
        load = parse_with_default(settings_cf, "load", dflt=False)
        export_json = parse_with_default(
            settings_cf, "export_json", dflt=False
        )
        export_path = override_export_path or parse_with_default(settings_cf, "export_path", dflt=None)
        return fit, save, load, export_json, export_path


def check_generation_times(rs, model):

    # If not all variants use same gen time
    if model.v_names is not None:
        # Check to see if all are present
        assert rs.variant.isin(model.v_names).all(), "All variants must be present in config or have same gen time."
    return None


def fit_models(rc, rs, locations, model, inference_method, path, save):
    multi_posterior = ef.MultiPosterior()

    check_generation_times(rs, model)

    for location in locations:
        # Subset to data of interest
        raw_cases = rc[rc.location == location].copy()
        raw_seq = rs[rs.location == location].copy()

        # Check to see if location available
        if len(raw_cases) == 0 or len(raw_seq) == 0:
            print(f'Location {location} not in data')
            continue

        # Define data object
        data = ef.CaseFrequencyData(raw_cases=raw_cases, raw_seq=raw_seq)

        # Fit model
        posterior = inference_method.fit(model, data, name=location)

        # Add posterior to group
        multi_posterior.add_posterior(posterior=posterior)

        # if save, save
        if save:
            posterior.save_posterior(f"{path}/models/{location}.json")

    return multi_posterior


def load_models(rc, rs, locations, model, path=None):
    multi_posterior = ef.MultiPosterior()

    for location in locations:
        # Subset to data of interest
        raw_cases = rc[rc.location == location].copy()
        raw_seq = rs[rs.location == location].copy()
        data = ef.CaseFrequencyData(raw_cases=raw_cases, raw_seq=raw_seq)

        # Load samples
        posterior = ef.PosteriorHandler(data=data, name=location)
        posterior.load_posterior(f"{path}/models/{location}.json")

        # Add posterior to group
        multi_posterior.add_posterior(posterior=posterior)

    return multi_posterior


def make_path_if_absent(path):
    dirname = os.getcwd()
    file_path = os.path.join(dirname, path)
    if not os.path.exists(file_path):
        os.makedirs(file_path)
        print(f"{path} created.")
    return None


def make_model_directories(path):
    make_path_if_absent(path)
    make_path_if_absent(path + "/models")


def export_results(multi_posterior, ps, path, data_name):
    EXPORT_SITES = ["freq", "R", "I_smooth", "ga"]
    EXPORT_DATED = [True, True, True, True]
    # Make directories
    make_model_directories(path)

    # Combine jsons from multiple model runs
    results = []
    for location, posterior in multi_posterior.locator.items():
        results.append(
            ef.posterior.get_sites_variants_tidy(
                posterior.samples,
                posterior.data,
                EXPORT_SITES,
                EXPORT_DATED,
                ps,
                location
        ))
    results = ef.posterior.combine_sites_tidy(results)
    ef.save_json(results, path=f"{path}/{data_name}_results.json")


if __name__ == "__main__":

    parser = argparse.ArgumentParser(
        description="Estimating variant growth rates."
    )
    parser.add_argument("--config", help="path to config file")
    parser.add_argument("--case-path", help="File path to cases data. Overrides data.case_path in config.")
    parser.add_argument("--seq-path", help="File path to sequence data. Overrides data.seq_path in config.")
    parser.add_argument("--export-path", help="Path to export directory. Overrides settings.export_path in config.")
    parser.add_argument("--data-name", help="Name of the data set to include in the results filename as <data_name>_results.json. Overrides data.name in config.")
    args = parser.parse_args()

    # Load configuration, data, and create model
    config = RenewalConfig(args.config)
    print(f"Config loaded: {config.path}")

    raw_cases, raw_seq, locations = config.load_data(args.case_path, args.seq_path)
    print("Data loaded sucessfuly")

    renewal_model = config.load_model()
    print("Model created.")

    inference_method = config.load_optim()
    print("Inference method defined.")

    fit, save, load, export_json, export_path = config.load_settings(args.export_path)
    print("Settings loaded")

    # Find export path
    if export_path:
        make_model_directories(export_path)

    # Fit or load model results
    if fit:
        print("Fitting model")
        multi_posterior = fit_models(
            raw_cases,
            raw_seq,
            locations,
            renewal_model,
            inference_method,
            export_path,
            save,
        )
    elif load:
        print("Loading results")
        multi_posterior = load_models(
            raw_cases,
            raw_seq,
            locations,
            renewal_model,
            export_path,
        )
    else:
        print("No models fit or results loaded.")
        multi_posterior = ef.MultiPosterior()

    # Export results
    if export_json and (fit or load):
        print(f"Exporting results as .json at {export_path}")
        ps = parse_with_default(
            config.config["settings"], "ps", dflt=[0.5, 0.8, 0.95]
        )
        data_name = args.data_name or config.config["data"]["name"]
        export_results(multi_posterior, ps[1:], export_path, data_name)
