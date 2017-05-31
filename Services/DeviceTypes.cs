// Copyright (c) Microsoft. All rights reserved.

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.Azure.IoTSolutions.DeviceSimulation.Services.Exceptions;
using Microsoft.Azure.IoTSolutions.DeviceSimulation.Services.Models;
using Microsoft.Azure.IoTSolutions.DeviceSimulation.Services.Runtime;
using Newtonsoft.Json;

// TODO: tests
// TODO: handle errors
namespace Microsoft.Azure.IoTSolutions.DeviceSimulation.Services
{
    public interface IDeviceTypes
    {
        IEnumerable<DeviceType> GetList();
        DeviceType Get(string id);
    }

    public class DeviceTypes : IDeviceTypes
    {
        private const string Ext = ".json";
        private readonly IServicesConfig config;

        private List<string> deviceTypeFiles;
        private List<DeviceType> deviceTypes;

        public DeviceTypes(IServicesConfig config)
        {
            this.config = config;
            this.deviceTypeFiles = null;
            this.deviceTypes = null;
        }

        public IEnumerable<DeviceType> GetList()
        {
            if (this.deviceTypes != null) return this.deviceTypes;

            this.deviceTypes = new List<DeviceType>();

            try
            {
                var files = this.GetDeviceTypeFiles();
                foreach (var f in files)
                {
                    var c = JsonConvert.DeserializeObject<DeviceType>(File.ReadAllText(f));
                    this.NormalizeObject(c);
                    this.deviceTypes.Add(c);
                }
            }
            catch (Exception e)
            {
                throw new InvalidConfigurationException("Unable to load Device Type configuration: " + e.Message, e);
            }

            return this.deviceTypes;
        }

        public DeviceType Get(string id)
        {
            var list = this.GetList();
            return list.FirstOrDefault(x => x.Id == id);
        }

        /// <summary>
        /// For user convenience and reduced verbosity, the JSON configuration
        /// is denormalized. This method normalizes the data for easier internal
        /// processing.
        /// </summary>
        private void NormalizeObject(DeviceType deviceType)
        {
            // The function Key is the function Name
            foreach (var x in deviceType.DeviceBehavior)
            {
                x.Value.Name = x.Key;
            }

            // The method Key is the method Name
            foreach (var x in deviceType.CloudToDeviceMethods)
            {
                x.Value.Name = x.Key;
            }
        }

        private List<string> GetDeviceTypeFiles()
        {
            if (this.deviceTypeFiles != null) return this.deviceTypeFiles;

            var fileEntries = Directory.GetFiles(this.config.DataFolder);
            this.deviceTypeFiles = fileEntries.Where(fileName => fileName.EndsWith(Ext)).ToList();

            return this.deviceTypeFiles;
        }
    }
}